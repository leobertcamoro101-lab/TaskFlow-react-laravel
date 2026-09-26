export const inputClass = (hasError?: boolean) =>
  `w-full bg-white border ${hasError ? 'border-red-300' : 'border-[#E9E0CF]'}
   text-[#2B2418] text-sm rounded-xl px-3 py-2.5 outline-none
   focus:border-[#B8862E] transition-colors placeholder-[#B8A98A]`;
