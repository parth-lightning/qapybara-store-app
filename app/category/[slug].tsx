import { useLocalSearchParams } from "expo-router";
import { Listing } from "../../components/shop";
export default function Category() {
  const { slug } = useLocalSearchParams<{ slug: string }>();
  return <Listing category={slug} />;
}
