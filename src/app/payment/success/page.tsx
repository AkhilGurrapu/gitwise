import Link from 'next/link'

export default function PaymentSuccessPage() {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-green-600 mb-4">Payment Successful!</h1>
        <p className="text-lg mb-4">Thank you for subscribing to Gitwise Pro.</p>
        <p>Your subscription is now active. You can access all premium features.</p>
        <Link href="/" className="mt-6 inline-block bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700">
          Go to Dashboard
        </Link>
      </div>
    );
  } 