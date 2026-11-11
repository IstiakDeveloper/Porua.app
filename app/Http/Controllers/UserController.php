<?php

namespace App\Http\Controllers;

use App\Models\Role;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class UserController extends Controller
{
    public function index(Request $request)
    {
        $this->authorize('view_users');

        $users = User::with('roles')
            ->when($request->search, function ($query, $search) {
                $query->where(function ($sub) use ($search) {
                    $sub->where('name', 'like', "%{$search}%")
                        ->orWhere('username', 'like', "%{$search}%")
                        ->orWhere('email', 'like', "%{$search}%")
                        ->orWhere('phone', 'like', "%{$search}%");
                });
            })
            ->when($request->role, fn ($q) => $q->byRole($request->role))
            ->when($request->status, fn ($q) => $q->where('status', $request->status))
            ->latest()
            ->paginate(20)
            ->withQueryString();

        return Inertia::render('Users/Index', [
            'users' => $users,
            'filters' => [
                'search' => $request->search ?? '',
                'role' => $request->role ?? '',
                'status' => $request->status ?? '',
            ],
            'roles' => Role::withCount('users')->get(),
            'stats' => [
                'total' => User::count(),
                'active' => User::where('status', 'active')->count(),
                'inactive' => User::whereIn('status', ['inactive', 'suspended'])->count(),
            ],
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
            'username' => 'nullable|string|min:3|max:50|regex:/^[a-zA-Z0-9_.-]+$/|unique:users,username',
            'email' => 'required|string|email|max:255|unique:users',
            'phone' => 'nullable|string|max:20',
            'password' => 'required|string|min:8|confirmed',
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

        $username = ! empty($validated['username'])
            ? trim($validated['username'])
            : User::generateUniqueUsername($validated['name'], $validated['email'], $validated['phone'] ?? null);

        $user = User::create([
            'name' => $validated['name'],
            'username' => $username,
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'password' => Hash::make($validated['password']),
            'status' => $validated['status'],
        ]);

        $user->roles()->sync($roleIds);

        logActivity('create', "Created user: {$user->name} (@{$user->username})", User::class, $user->id);

        return redirect()->route('users.index')
            ->with('success', 'User created successfully with username @'.$user->username);
    }

    public function show(User $user)
    {
        $this->authorize('view_users');

        $user->load([
            'roles.permissions',
            'student.schoolClass',
            'student.section',
            'teacher',
            'staff',
            'studentParent.students',
        ]);

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
            'username' => [
                'nullable',
                'string',
                'min:3',
                'max:50',
                'regex:/^[a-zA-Z0-9_.-]+$/',
                Rule::unique('users')->ignore($user->id),
            ],
            'email' => ['required', 'string', 'email', 'max:255', Rule::unique('users')->ignore($user->id)],
            'phone' => 'nullable|string|max:20',
            'password' => 'nullable|string|min:8|confirmed',
            'role_ids' => 'required|array',
            'role_ids.*' => 'exists:roles,id',
            'status' => 'required|in:active,inactive,suspended',
        ]);

        $username = ! empty($validated['username'])
            ? trim($validated['username'])
            : ($user->username ?: User::generateUniqueUsername($validated['name'], $validated['email'], $validated['phone'] ?? null, $user->id));

        $user->update([
            'name' => $validated['name'],
            'username' => $username,
            'email' => $validated['email'],
            'phone' => $validated['phone'] ?? null,
            'status' => $validated['status'],
        ]);

        $passwordChanged = false;
        if (! empty($validated['password'])) {
            $user->update(['password' => Hash::make($validated['password'])]);
            $passwordChanged = true;
        }

        $user->roles()->sync($validated['role_ids']);

        logActivity('update', "Updated user: {$user->name} (@{$user->username})", User::class, $user->id);

        // If current user changed their own password, logout from current device and redirect to login
        if ($passwordChanged && $user->id === Auth::id()) {
            Auth::guard('web')->logout();
            $request->session()->invalidate();
            $request->session()->regenerateToken();

            return redirect()->route('login')
                ->with('success', 'Your password was updated successfully. You have been logged out from all devices. Please log in with your new password.');
        }

        $message = $passwordChanged
            ? 'User updated successfully. The user has been logged out from all devices.'
            : 'User updated successfully';

        return redirect()->route('users.index')
            ->with('success', $message);
    }

    public function toggleStatus(User $user)
    {
        $this->authorize('edit_users');

        if ($user->id === Auth::id()) {
            return back()->with('error', 'You cannot change your own account status.');
        }

        $newStatus = $user->status === 'active' ? 'suspended' : 'active';
        $user->update(['status' => $newStatus]);

        logActivity('update', "Toggled status of user {$user->name} to {$newStatus}", User::class, $user->id);

        return back()->with('success', "User '{$user->name}' status changed to {$newStatus}.");
    }

    public function destroy(User $user)
    {
        $this->authorize('delete_users');

        if ($user->id === Auth::id()) {
            return back()->with('error', 'You cannot delete your own account.');
        }

        $userName = $user->name;
        $user->delete();

        logActivity('delete', "Deleted user: {$userName}", User::class, $user->id);

        return redirect()->route('users.index')
            ->with('success', 'User deleted successfully');
    }
}
