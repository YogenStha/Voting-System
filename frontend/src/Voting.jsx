 export  default function Voting(){
  return(
     <>
    <div className="min-h-screen bg-gray-50">
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-4">
              <h1 className="text-xl font-bold text-blue-600">ChunabE</h1>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="h-4 w-4" />
              <span className="text-sm text-gray-600">Voting System</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </>
  );
}