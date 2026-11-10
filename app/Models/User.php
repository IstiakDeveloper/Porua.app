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
                    Log::warning("Failed to clear sessions for user {$user->id}: " . $e->getMessage());
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
            Log::warning("Failed to clear sessions for user {$this->id}: " . $e->getMessage());
        }

        $this->forceFill([
            'remember_token' => Str::random(60),
        ])->saveQuietly();
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
