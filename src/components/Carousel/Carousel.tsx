import React, { useEffect, useState } from "react";
import "./Carousel.css";

interface CarouselProps {
  images: string[];
  autoSlide?: boolean;
  autoSlideInterval?: number;
}

const Carousel: React.FC<CarouselProps> = ({ images, autoSlide = true, autoSlideInterval = 10000 }) => {
  const [currentIndex, setCurrentIndex] = useState<number>(1);
  const [displayImages, setDisplayImages] = useState<string[]>([]);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(true);

  useEffect(() => {
    if (images.length > 0) {
      const clonedImages = [images[images.length - 1], ...images, images[0]];
      setDisplayImages(clonedImages);
    }
  }, [images]);

  const nextSlide = () => {
    if (displayImages.length === 0) return;
    setIsTransitioning(true);
    setCurrentIndex((prevIndex) => prevIndex + 1);
  };

  // const prevSlide = () => {
  //   if (displayImages.length === 0) return;
  //   setIsTransitioning(true);
  //   setCurrentIndex((prevIndex) => prevIndex - 1);
  // };

  // Auto-slide effect that starts immediately
  useEffect(() => {
    if (!autoSlide || displayImages.length === 0) return;

    const interval = setInterval(() => {
      nextSlide();
    }, autoSlideInterval);

    return () => clearInterval(interval);
  }, [displayImages.length, autoSlide, autoSlideInterval]); // Start immediately on mount

  // Handle looping effect when transitioning
  useEffect(() => {
    const transitionEndHandler = setTimeout(() => {
      if (currentIndex === displayImages.length - 1) {
        setIsTransitioning(false);
        setCurrentIndex(1);
      } else if (currentIndex === 0) {
        setIsTransitioning(false);
        setCurrentIndex(displayImages.length - 2);
      }
    }, 500); // Wait for transition to complete before resetting position

    return () => clearTimeout(transitionEndHandler);
  }, [currentIndex, displayImages.length]);

  return (
    <div className="container__slider">
      {/* <button className="slider__btn-prev" onClick={prevSlide}>
        {"<"}
      </button> */}

      <div
        className="slider__track"
        style={{
          transform: `translateX(-${currentIndex * 100}%)`,
          transition: isTransitioning ? "transform 0.5s ease-in-out" : "none",
        }}
      >
        {displayImages.map((src, index) => (
          <div className="slider__item" key={index}>
            <img src={src} alt={`Slide ${index}`} />
          </div>
        ))}
      </div>

      {/* <button className="slider__btn-next" onClick={nextSlide}>
        {">"}
      </button> */}

      {/* <div className="container__slider__links">
        {images.map((_, index) => (
          <button
            key={index}
            className={`container__slider__links-small ${
              index + 1 === currentIndex ? "container__slider__links-small-active" : ""
            }`}
            onClick={() => setCurrentIndex(index + 1)}
          />
        ))}
      </div> */}
    </div>
  );
};

export default Carousel;