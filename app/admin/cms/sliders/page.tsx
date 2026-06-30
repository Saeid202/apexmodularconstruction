import { getSlides } from "@/app/actions/cms-sliders";
import { getSiteSettings } from "@/app/actions/cms-settings";
import { SliderList } from "@/components/admin/cms/sliders/SliderList";
import type { HeroSlideRow } from "@/types/cms";

export default async function SlidersPage() {
  const [{ data: slides }, settings] = await Promise.all([getSlides(), getSiteSettings()]);

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Slider Manager</h1>
        <p className="text-sm text-gray-500 mt-1">Manage hero slides displayed on the homepage</p>
      </div>
      <SliderList
        initialSlides={(slides as HeroSlideRow[]) ?? []}
        autoplay={settings.hero_autoplay ?? false}
        autoplayInterval={settings.hero_autoplay_interval ?? 5}
      />
    </div>
  );
}
