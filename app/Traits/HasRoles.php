<?php

namespace App\Traits;

use App\Models\Role;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

trait HasRoles
{
    /**
     * Get all roles assigned to the user.
     */
    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class, 'role_user');
    }

    /**
     * Assign a role to the user.
     */
    public function assignRole(string|int|Role $role): self
    {
        $roleId = $role instanceof Role ? $role->id : $role;

        if (is_string($role)) {
            $roleModel = Role::where('slug', $role)->orWhere('name', $role)->first();
            $roleId = $roleModel?->id;
        }

        if ($roleId && !$this->roles->contains($roleId)) {
            $this->roles()->attach($roleId);
        }

        return $this;
    }

    /**
     * Assign multiple roles to the user.
     */
    public function assignRoles(array $roles): self
    {
        foreach ($roles as $role) {
            $this->assignRole($role);
        }

        return $this;
    }

    /**
     * Remove a role from the user.
     */
    public function removeRole(string|int|Role $role): self
    {
        $roleId = $role instanceof Role ? $role->id : $role;

        if (is_string($role)) {
            $roleModel = Role::where('slug', $role)->orWhere('name', $role)->first();
            $roleId = $roleModel?->id;
        }

        if ($roleId) {
            $this->roles()->detach($roleId);
        }

        return $this;
    }

    /**
     * Remove all roles from the user.
     */
    public function removeAllRoles(): self
    {
        $this->roles()->detach();
        return $this;
    }

    /**
     * Sync roles with the user.
     */
    public function syncRoles(array $roles): self
    {
        $roleIds = collect($roles)->map(function ($role) {
            if ($role instanceof Role) {
                return $role->id;
            }
            if (is_numeric($role)) {
                return $role;
            }
            return Role::where('slug', $role)->orWhere('name', $role)->first()?->id;
        })->filter()->toArray();

        $this->roles()->sync($roleIds);
        return $this;
    }

    /**
     * Check if user has a specific role.
     */
    public function hasRole(string|int|Role $role): bool
    {
        if ($role instanceof Role) {
            return $this->roles->contains($role->id);
        }

        if (is_numeric($role)) {
            return $this->roles->contains($role);
        }

        return $this->roles->contains(function ($userRole) use ($role) {
            return $userRole->name === $role || $userRole->slug === $role;
        });
    }

    /**
     * Check if user has any of the given roles.
     */
    public function hasAnyRole(array $roles): bool
    {
        foreach ($roles as $role) {
            if ($this->hasRole($role)) {
                return true;
            }
        }

        return false;
    }

    /**
     * Check if user has all of the given roles.
     */
    public function hasAllRoles(array $roles): bool
    {
        foreach ($roles as $role) {
            if (!$this->hasRole($role)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Check if user is a super admin.
     */
    public function isSuperAdmin(): bool
    {
        return $this->hasRole('Super Admin') || $this->hasRole('super-admin');
    }

    /**
     * School-wide Admin (below Super Admin): broad access but no edit/delete of records.
     */
    public function isAdmin(): bool
    {
        return $this->hasRole('Admin') || $this->hasRole('admin');
    }

    /**
     * Check if user is a principal.
     */
    public function isPrincipal(): bool
    {
        return $this->hasRole('Principal') || $this->hasRole('principal');
    }

    /**
     * Check if user is a teacher.
     */
    public function isTeacher(): bool
    {
        return $this->hasRole('Teacher') || $this->hasRole('teacher');
    }

    /**
     * Check if user is a student.
     */
    public function isStudent(): bool
    {
        return $this->hasRole('Student') || $this->hasRole('student');
    }

    /**
     * Check if user is a parent.
     */
    public function isParent(): bool
    {
        return $this->hasRole('Parent') || $this->hasRole('parent');
    }

    /**
     * Check if user is an accountant.
     */
    public function isAccountant(): bool
    {
        return $this->hasRole('Accountant') || $this->hasRole('accountant');
    }

    /**
     * Check if user is a librarian.
     */
    public function isLibrarian(): bool
    {
        return $this->hasRole('Librarian') || $this->hasRole('librarian');
    }
}
