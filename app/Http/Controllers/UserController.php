<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('view_users');

        $users = User::with('roles')
            ->when($request->search, fn ($q) => $q->where('name', 'like', "%{$request->search}%")
                ->orWhere('email', 'like', "%{$request->search}%"))
            ->when($request->role, fn ($q) => $q->byRole($request->role))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(20)->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => $request->only(['search', 'role', 'status']),
            'roles' => Role::all(),
        ]);
    }

    public function create()
    {
        $this->authorize('create_users');

        return Inertia::render('Users/Create', [
            'roles' => Role::all(),
        ]);
    }

    public function store(Request $request)
    {
        $this->authorize('create_users');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
            // Frontend sends role_ids; accept both keys for backward compatibility.
            'role_ids' => 'nullable|array',
            'role_ids.*' => 'exists:roles,id',
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,id',
            'status' => 'required|in:active,inactive,suspended',
        ]);

        $roleIds = $validated['role_ids'] ?? $validated['roles'] ?? null;
        if (empty($roleIds) || ! is_array($roleIds)) {
            return back()->withErrors(['role_ids' => 'Please select at least one role.'])->withInput();
        }

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'password' => Hash::make($validated['password']),
            'status' => $validated['status'],
        ]);

        $user->roles()->sync($roleIds);

        logActivity('create', "Created user: {$user->name}", User::class, $user->id);

        return redirect()->route('users.index')
            ->with('success', 'User created successfully');
    }

    public function show(User $user)
    {
        $this->authorize('view_users');

        $user->load(['roles.permissions', 'student', 'teacher', 'staff', 'studentParent']);

        return Inertia::render('Users/Show', [
            'user' => $user,
        ]);
    }

    public function edit(User $user)
    {
        $this->authorize('edit_users');

        $user->load('roles');

        return Inertia::render('Users/Edit', [
            'user' => $user,
            'roles' => Role::all(),
        ]);
    }

    public function update(Request $request, User $user)
    {
        $this->authorize('edit_users');

        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8|confirmed',
            'role_ids' => 'required|array',
            'role_ids.*' => 'exists:roles,id',
            'status' => 'required|in:active,inactive,suspended',
        ]);

        $user->update([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'phone' => $validated['phone'],
            'status' => $validated['status'],
        ]);

        if (! empty($validated['password'])) {
            $user->update(['password' => Hash::make($validated['password'])]);
        }

        $user->roles()->sync($validated['role_ids']);

        logActivity('update', "Updated user: {$user->name}", User::class, $user->id);

        return redirect()->route('users.index')
            ->with('success', 'User updated successfully');
    }

    public function destroy(User $user)
    {
        $this->authorize('delete_users');

        $userName = $user->name;
        $user->delete();

        logActivity('delete', "Deleted user: {$userName}", User::class, $user->id);

        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully');
    }
}
