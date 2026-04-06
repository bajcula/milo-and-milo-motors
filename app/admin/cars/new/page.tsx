export const dynamic = 'force-dynamic'

import NewCarForm from './NewCarForm'

export default function NewCarPage() {
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold mb-6">Add New Car</h1>
      <NewCarForm />
    </div>
  )
}
