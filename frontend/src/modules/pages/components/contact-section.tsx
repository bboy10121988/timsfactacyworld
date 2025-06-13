"use client"

interface ContactSectionProps {
  title?: string
  address?: string
  phone?: string
  email?: string
  businessHours?: Array<{
    days: string
    hours: string
  }>
  socialLinks?: Array<{
    platform: string
    url: string
  }>
  googleMapsUrl?: string
}

export default function ContactSection({
  title,
  address,
  phone,
  email,
  businessHours,
  socialLinks,
  googleMapsUrl
}: ContactSectionProps) {
  return (
    <div className="bg-gray-50 py-12">
      <div className="content-container">
        {title && (
          <h2 className="h1 text-center">
            {title}
          </h2>
        )}
        
        <div className="grid md:grid-cols-2 gap-8">
          <div>
            {address && (
              <div className="mb-4">
                <h3 className="h4 mb-2">地址</h3>
                <p className="text-gray-600">{address}</p>
              </div>
            )}
            
            {phone && (
              <div className="mb-4">
                <h3 className="h4 mb-2">電話</h3>
                <a href={`tel:${phone}`} className="text-gray-600 hover:text-gray-900">
                  {phone}
                </a>
              </div>
            )}
            
            {email && (
              <div className="mb-4">
                <h3 className="h4 mb-2">Email</h3>
                <a href={`mailto:${email}`} className="text-gray-600 hover:text-gray-900">
                  {email}
                </a>
              </div>
            )}
            
            {businessHours && businessHours.length > 0 && (
              <div className="mb-4">
                <h3 className="h4 mb-2">營業時間</h3>
                {businessHours.map((hours, index) => (
                  <div key={index} className="flex justify-between text-gray-600">
                    <span>{hours.days}</span>
                    <span>{hours.hours}</span>
                  </div>
                ))}
              </div>
            )}
            
            {socialLinks && socialLinks.length > 0 && (
              <div className="mb-4">
                <h3 className="h4 mb-2">社群媒體</h3>
                <div className="flex space-x-4">
                  {socialLinks.map((social, index) => (
                    <a
                      key={index}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-gray-600 hover:text-gray-900"
                    >
                      {social.platform}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
          
          <div>
            {googleMapsUrl && (
              <div className="h-64 bg-gray-200 rounded-lg overflow-hidden">
                <iframe
                  src={googleMapsUrl}
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  allowFullScreen={false}
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
