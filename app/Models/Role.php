<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Role extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'slug',
        'description',
    ];

    // Relationships
    public function users()
    {
        return $this->belongsToMany(User::class, 'role_user');
    }

    public function permissions()
    {
        return $this->belongsToMany(Permission::class, 'permission_role');
    }

    // Methods
    public function givePermissionTo(string|int|Permission ...$permissions): self
    {
        $permissionIds = collect($permissions)->map(function ($permission) {
            if ($permission instanceof Permission) {
                return $permission->id;
            }
            if (is_numeric($permission)) {
                return $permission;
            }
            return Permission::where('slug', $permission)->orWhere('name', $permission)->first()?->id;
        })->filter()->toArray();

        $this->permissions()->syncWithoutDetaching($permissionIds);
        return $this;
    }

    public function revokePermissionTo(string|int|Permission ...$permissions): self
    {
        $permissionIds = collect($permissions)->map(function ($permission) {
            if ($permission instanceof Permission) {
                return $permission->id;
            }
            if (is_numeric($permission)) {
                return $permission;
            }
            return Permission::where('slug', $permission)->orWhere('name', $permission)->first()?->id;
        })->filter()->toArray();

        $this->permissions()->detach($permissionIds);
        return $this;
    }

    public function hasPermission(string|int|Permission $permission): bool
    {
        if ($permission instanceof Permission) {
            return $this->permissions->contains($permission->id);
        }

        if (is_numeric($permission)) {
            return $this->permissions->contains('id', $permission);
        }

        return $this->permissions->contains(function ($perm) use ($permission) {
            return $perm->name === $permission || $perm->slug === $permission;
        });
    }

    // Scopes
    public function scopeBySlug($query, $slug)
    {
        return $query->where('slug', $slug);
    }
}
