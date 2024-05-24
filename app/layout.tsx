import './globals.css'


export const metadata = {
  title: 'Analytics',
  description: 'Unleash Data-Driven Programming Excellence',
  themeColor: { color: '#1b238d' },
  keywords: [],
  mainfest: {
    type: "website",
    url: "https://analyticsedify.com",
    title: "Analytics",
    description: "Analytics will deliver an enriching and enlightening experience to your students. The expert team conducting the sessions would encourage and bring out positive changes among your students.",
    siteName: "Analytics",
    images: [{
      url: "https://analyticsedify.com/ui/analytics.png",
    }],
  }
}

export default function IndexLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  )
}