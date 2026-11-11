<?php

namespace App\Models;

use App\Traits\HasPermissions;
use App\Traits\HasRoles;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Str;

class User extends Authenticatable
{
    use HasFactory, HasPermissions, HasRoles, Notifiable, SoftDeletes;

    protected $fillable = [
        'name',
        'username',
        'email',
        'password',
        'phone',
        'avatar',
        'status',
        'last_login_at',
        'last_login_ip',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'password' => 'hashed',
        ];
    }

    protected static function booted(): void
    {
        static::creating(function (User $user) {
            if (empty($user->username)) {
                $user->username = static::generateUniqueUsername(
                    $user->name,
                    $user->email,
                    $user->phone
                );
            }
        });

        static::updating(function (User $user) {
            if ($user->isDirty('password')) {
                // Invalidate remember_token so "Remember Me" cookies cannot auto-login
                $user->setRememberToken(Str::random(60));
            }
        });

        static::updated(function (User $user) {
            if ($user->wasChanged('password')) {
                // Terminate all active database sessions for this user across all devices
                try {
                    DB::table('sessions')->where('user_id', $user->id)->delete();
                } catch (\Throwable $e) {
                    Log::warning("Failed to clear sessions for user {$user->id}: ".$e->getMessage());
                }
            }
        });
    }

    /**
     * Terminate all active sessions and invalidate remember tokens for this user.
     */
    public function logoutAllDevices(): void
    {
        try {
            DB::table('sessions')->where('user_id', $this->id)->delete();
        } catch (\Throwable $e) {
            Log::warning("Failed to clear sessions for user {$this->id}: ".$e->getMessage());
        }

        $this->forceFill([
            'remember_token' => Str::random(60),
        ])->saveQuietly();
    }

    /**
     * Generate a clean, unique username from user attributes.
     */
    public static function generateUniqueUsername(?string $name, ?string $email = null, ?string $phone = null, ?int $ignoreUserId = null): string
    {
        $candidate = null;

        // 1. If clean phone number is provided (e.g. 01xxxxxxxxx)
        if (! empty($phone)) {
            $digits = preg_replace('/[^0-9]/', '', $phone);
            if (strlen($digits) >= 10 && strlen($digits) <= 15) {
                $candidate = $digits;
            }
        }

        // 2. If email is provided, use email prefix
        if (empty($candidate) && ! empty($email)) {
            $prefix = explode('@', $email)[0];
            $cleanPrefix = strtolower(preg_replace('/[^a-zA-Z0-9_.-]/', '', $prefix));
            if (strlen($cleanPrefix) >= 3) {
                $candidate = $cleanPrefix;
            }
        }

        // 3. Fallback to name
        if (empty($candidate) && ! empty($name)) {
            $cleanName = strtolower(preg_replace('/[^a-zA-Z0-9_]/', '', str_replace([' ', '-', '.'], '_', trim($name))));
            $cleanName = trim(preg_replace('/_+/', '_', $cleanName), '_');
            if (strlen($cleanName) >= 3) {
                $candidate = substr($cleanName, 0, 30);
            }
        }

        // 4. Default fallback
        if (empty($candidate)) {
            $candidate = 'user_'.Str::lower(Str::random(6));
        }

        // Guarantee uniqueness against DB
        $base = $candidate;
        $counter = 1;
        while (static::where('username', $candidate)
            ->when($ignoreUserId, fn ($q) => $q->where('id', '!=', $ignoreUserId))
            ->exists()) {
            $candidate = substr($base, 0, 40).'_'.$counter++;
        }

        return $candidate;
    }

    // Relationships
    public function roles()
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    public function student()
    {
        return $this->hasOne(Student::class);
    }

    public function teacher()
    {
        return $this->hasOne(Teacher::class);
    }

    public function staff()
    {
        return $this->hasOne(Staff::class);
    }

    public function studentParent()
    {
        return $this->hasOne(StudentParent::class);
    }

    public function sentMessages()
    {
        return $this->hasMany(Message::class, 'sender_id');
    }

    public function receivedMessages()
    {
        return $this->hasMany(Message::class, 'receiver_id');
    }

    public function notifications()
    {
        return $this->hasMany(Notification::class);
    }

    public function activityLogs()
    {
        return $this->hasMany(ActivityLog::class);
    }

    // Scopes
    public function scopeActive($query)
    {
        return $query->where('status', 'active');
    }

    public function isActive(): bool
    {
        return $this->status === 'active';
    }

    public function scopeByRole($query, $role)
    {
        return $query->whereHas('roles', function ($q) use ($role) {
            $q->where('slug', $role)->orWhere('name', $role);
        });
    }

    public function scopeByPermission($query, $permission)
    {
        return $query->whereHas('roles.permissions', function ($q) use ($permission) {
            $q->where('slug', $permission)->orWhere('name', $permission);
        });
    }

    /**
     * Only Super Admin may change or remove existing records (Admin role is view/create only).
     */
    public function canEditOrDeleteRecords(): bool
    {
        return $this->isSuperAdmin();
    }
}
