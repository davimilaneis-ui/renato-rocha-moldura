import rIcon from "../assets/logo-icone-r.png";

export default function Hero() {
  return (
    <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
      <p className="mb-1 font-gallegos leading-none text-amarelo text-[calc(clamp(2.5rem,6vw,4rem)*1.5)] lg:mb-2 lg:text-[calc(clamp(2.5rem,6vw,5.5rem)*1.5)]">
        Apoie
      </p>
      <h1 className="mb-4 font-grift font-bold leading-[0.95] text-white text-[clamp(2.5rem,6vw,4rem)] lg:mb-6 lg:text-[clamp(2.5rem,6vw,5.5rem)]">
        <span className="block">Renato</span>
        <span className="block">Rocha!</span>
      </h1>
      <p className="mb-4 max-w-sm font-grift font-medium leading-[1.4] text-white/80 text-[clamp(1rem,2vw,1.25rem)] lg:mb-6 lg:max-w-xl lg:text-[clamp(1rem,2vw,1.5rem)]">
        Insira sua foto em nossa moldura de campanha e preste seu apoio ao nosso advogado do povo!
      </p>
      <img src={rIcon} alt="" className="h-10 w-auto lg:h-16" />
    </div>
  );
}
