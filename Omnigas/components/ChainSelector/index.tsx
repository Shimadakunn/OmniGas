"use client";
import Image from "next/image";

import { chains } from "@/constants/chains";
import { useMe } from "@/providers/MeProvider";

import { Button } from "@/components/ui/button";
import { Carousel, CarouselContent } from "@/components/ui/carousel";

const ChainSelector = () => {
  const { switchChain, chain } = useMe();
  return (
    <Carousel
      opts={{
        align: "center",
        axis: "y",
      }}
      className="w-full max-w-sm px-2 h-[5vh]"
    >
      <CarouselContent className="space-x-4 px-4 border">
        <Button onClick={() => switchChain(undefined)}>All</Button>
        {Object.keys(chains).map((key) => (
          <Button
            key={key}
            onClick={() => switchChain(chains[key].viem)}
            className="px-6 py-2"
          >
            <Image
              src={`/chains-icons/${chains[key].viem.name}.svg`}
              width={25}
              height={25}
              alt={chains[key].viem.name}
            />
            {/* {chains[key].viem.name} */}
          </Button>
        ))}
      </CarouselContent>
    </Carousel>
  );
};

export default ChainSelector;
