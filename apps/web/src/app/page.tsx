import { redirect } from 'next/navigation'

// Redirect to chat page by default
export default function HomePage() {
  redirect('/chat')
}