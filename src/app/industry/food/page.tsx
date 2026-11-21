import { redirect } from 'next/navigation'

// 旧URL（/industry/food）を正しいページへ案内する
export default function IndustryFoodRedirect() {
  redirect('/industry/food-manufacturing')
}
