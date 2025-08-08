import ToolsPageClient from "./tools-page-client"

interface ToolsPageProps {
  params: Promise<{ countryCode: string }>
}

export default async function ToolsPage({ params }: ToolsPageProps) {
  const { countryCode } = await params

  return <ToolsPageClient countryCode={countryCode} />
}
