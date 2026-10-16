import HeroSection from "../components/home/HeroSection";
import BrandStrip from "../components/home/BrandStrip";
import ProductSection from "../components/home/ProductSection";
import DressStyleSection from "../components/home/DressStyleSection";
import CustomerReviews from "../components/home/CustomerReviews";
function Home() {
    return (
        <>
            <HeroSection />

            <BrandStrip />

            <ProductSection
                title="NEW ARRIVALS"
                showViewAll
                ordering="-created_at"
            />

            <ProductSection
                title="TOP SELLING"
                showViewAll
                ordering="-rating"
            />

            <DressStyleSection />
            <CustomerReviews />
        </>
    );
}

export default Home;