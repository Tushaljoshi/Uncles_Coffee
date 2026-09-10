import React, { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

const LanguageSelector = () => {
  const {
    language,
    changeLanguage,
  } = useLanguage();

  const [open, setOpen] = useState(false);

  const languages = [
    {
      code: "en",
      label: "English",
      native: "English",
    },
    {
      code: "hi",
      label: "Hindi",
      native: "हिन्दी",
    },
  ];

  const currentLanguage =
    languages.find(
      (item) => item.code === language
    ) || languages[0];

  return (
    <div className="relative">

      {/* =================================================
          SELECTOR BUTTON
      ================================================= */}

      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="
          flex
          items-center
          gap-2
          rounded-full
          border
          border-[#E5D9CA]
          bg-[#F7F2EA]
          px-3
          py-2
          text-[10px]
          font-medium
          text-espresso
          transition
          hover:bg-latte
        "
      >

        <span className="text-sm">
          🌐
        </span>

        <span className="hidden sm:inline">
          {currentLanguage.native}
        </span>

        <span className="text-[8px]">
          ▼
        </span>

      </button>

      {/* =================================================
          DROPDOWN
      ================================================= */}

      {open && (
        <div
          className="
            absolute
            right-0
            top-[calc(100%+8px)]
            z-[100]
            w-[145px]
            overflow-hidden
            rounded-xl
            border
            border-[#E5D9CA]
            bg-white
            p-1
            shadow-[0_10px_30px_rgba(61,35,20,0.12)]
          "
        >

          {languages.map((item) => {

            const selected =
              language === item.code;

            return (
              <button
                key={item.code}
                type="button"
                onClick={() => {
                  changeLanguage(
                    item.code
                  );
                  setOpen(false);
                }}
                className={`
                  flex
                  w-full
                  items-center
                  justify-between
                  rounded-lg
                  px-3
                  py-2.5
                  text-left
                  text-[10px]
                  transition
                  ${
                    selected
                      ? "bg-caramel text-cream"
                      : "text-espresso hover:bg-latte"
                  }
                `}
              >

                <span>
                  {item.native}
                </span>

                {selected && (
                  <span>
                    ✓
                  </span>
                )}

              </button>
            );
          })}

        </div>
      )}

    </div>
  );
};

export default LanguageSelector;