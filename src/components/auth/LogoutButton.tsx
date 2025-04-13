'use client'

// Note: Server Actions are called via forms, so this component handles the form submission.
// The actual sign-out logic resides in the server action defined elsewhere.

interface LogoutButtonProps {
  signOutAction: () => Promise<void> // Function prop to call the Server Action
}

export default function LogoutButton({ signOutAction }: LogoutButtonProps) {
  return (
    <form action={signOutAction}> {/* Call the server action on form submit */} 
      <button
        type="submit"
        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
      >
        Logout
      </button>
    </form>
  )
} 