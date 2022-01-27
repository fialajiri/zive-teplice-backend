# [Živé Teplice - Backend](https://zive-teplice-frontend.vercel.app/)

## Obecné informace
Tento projekt představuje backend k webové aplikaci Živé Teplice. Tato webová aplikace slouží jako prostor pro prezentaci a administraci kulturní akce Živé Teplice. Tento backend umožnuje:

  - Autorizaci a authentikaci uživatelů pomicí jwt tokenů a HttpOnly Cookies
  - Registraci uživatelů
  - Vkládání, editaci a mazání příspěvků a aktualit
  - Vytváření fotogalerií a nahrávání obrázků
  
## Technologie
  - Backend je napsaný v javascriptu a bězí pomocí Node.js
  
  - Authorizace a authentikace uživatelů pomocí json web tokenů  
    - jsonwebtoken: 8.5.1
    - passport: 0.5.0
    - passport-jwt: 4.0.0
    - passport-local: 1.0.0
    
  - Všechna data se ukládají do databáze MongoDB  
    - mongoose: 6.0.13
    
  - Fotografie se ukládají do AWS S3 Bucketu
    - aws-sdk: 2.1035.0
    - multer: 1.4.3
    - multer-s3: 2.10.0
    
  - Frontend je napsaný v javascriptu s použitím knihovny React a frameworku Next.js
    - kód je k prohlédnutí [zde](https://github.com/fialajiri/zive-teplice-frontend)
  
