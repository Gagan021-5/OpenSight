import { SignUp } from '@clerk/clerk-react';

const SignUpPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-indigo-900 mb-2">OpenSight</h1>
          <p className="text-gray-600">Create Your Vision Therapy Account</p>
        </div>
        <SignUp
          routing="path"
          path="/sign-up"
          signInUrl="/sign-in"
          afterSignUpUrl="/setup"
        />
      </div>
    </div>
  );
};

export default SignUpPage;
