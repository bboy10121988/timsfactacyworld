import SettingsPageClient from "./settings-page-client"

interface SettingsPageProps {
  params: Promise<{ countryCode: string }>
}

export default async function SettingsPage({ params }: SettingsPageProps) {
  const { countryCode } = await params

  return <SettingsPageClient countryCode={countryCode} />
}
