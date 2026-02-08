import { Data_handler } from "@/lib/data_handler";

export default async function Home() {
  const data = await Data_handler();
  return <div></div>;
}
