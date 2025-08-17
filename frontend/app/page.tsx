import UdyamRegistrationForm from '@/components/UdyamRegistrationForm'

export default function Home() {
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Test Tailwind Styles */}
      <div className="bg-red-500 text-white p-4 mb-4 rounded-lg">
        <p>🔧 Tailwind Test: If you see red background, Tailwind is working!</p>
      </div>
      
      <div className="text-center mb-8">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">
          Udyam Registration Form
        </h2>
        <p className="text-gray-600">
          Register your micro, small or medium enterprise
        </p>
      </div>
      
      <UdyamRegistrationForm />
    </div>
  )
}
