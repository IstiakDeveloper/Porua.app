<?php

namespace App\Traits;

use App\Models\Permission;
use Illuminate\Support\Collection;

trait HasPermissions
{
    /**
     * Get all permissions for the user (through roles).
     */
    public function permissions(): Collection
    {
        return $this->roles->flatMap->permissions->unique('id');
    }

    /**
     * Check if user has a specific permission.
     */
    public function hasPermission(string|int|Permission $permission): bool
    {
        // Super admin has all permissions
        if ($this->isSuperAdmin()) {
            return true;
        }

        if ($permission instanceof Permission) {
            return $this->permissions()->contains($permission->id);
        }

        if (is_numeric($permission)) {
            return $this->permissions()->contains('id', $permission);
        }

        return $this->permissions()->contains(function ($userPermission) use ($permission) {
            return $userPermission->name === $permission || $userPermission->slug === $permission;
        });
    }

    /**
     * Check if user has any of the given permissions.
     */
    public function hasAnyPermission(array $permissions): bool
    {
        // Super admin has all permissions
        if ($this->isSuperAdmin()) {
            return true;
        }

        foreach ($permissions as $permission) {
            if ($this->hasPermission($permission)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user has all of the given permissions.
     */
    public function hasAllPermissions(array $permissions): bool
    {
        // Super admin has all permissions
        if ($this->isSuperAdmin()) {
            return true;
        }

        foreach ($permissions as $permission) {
            if (!$this->hasPermission($permission)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Give permission to a role (for direct role manipulation).
     */
    public function givePermissionTo(string|int|Permission $permission): self
    {
        // This method is for Role model, but included here for completeness
        return $this;
    }

    /**
     * Get permission names for the user.
     */
    public function getPermissionNames(): array
    {
        return $this->permissions()->pluck('name')->toArray();
    }

    /**
     * Get permission slugs for the user.
     */
    public function getPermissionSlugs(): array
    {
        return $this->permissions()->pluck('slug')->toArray();
    }
}
