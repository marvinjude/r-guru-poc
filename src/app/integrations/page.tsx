import { IntegrationList } from "./components/integrations-list"

export default function Integrations() {
  return (
    <div className="px-4 py-6 sm:px-0 container mx-auto py-10">
      <h1 className="text-3xl font-bold text-gray-900">
        Integrations
      </h1>
      <IntegrationList />
    </div>
  )
}
