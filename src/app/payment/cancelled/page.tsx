import Link from 'next/link'

export default function PaymentCancelledPage() {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <h1 className="text-3xl font-bold text-red-600 mb-4">Payment Cancelled</h1>
        <p className="text-lg mb-4">Your subscription process was cancelled.</p>
        <p>You have not been charged. You can try subscribing again if you wish.</p>
        <div className="mt-6">
          <Link href="/subscribe" className="bg-indigo-600 text-white py-2 px-4 rounded hover:bg-indigo-700 mr-4">
            Retry Subscription
          </Link>
          <Link href="/" className="text-blue-600 hover:underline">
            Go to Homepage
          </Link>
        </div>
      </div>
    );
  } 