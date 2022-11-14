# [Živé Teplice - Backend](https://www.ziveteplice.cz/)

## CZ

### Obecné informace
Tento projekt představuje backend k webové aplikaci Živé Teplice. Tato webová aplikace slouží jako prostor pro prezentaci a administraci kulturní akce Živé Teplice. Tento backend umožnuje:

  - Autorizaci a authentikaci uživatelů pomocí jwt tokenů a HttpOnly Cookies
  - Registraci uživatelů
  - Vkládání, editaci a mazání příspěvků a aktualit
  - Vytváření fotogalerií a nahrávání obrázků
  
### Technologie
  - Backend je napsaný v javascriptu pomocí frameworku Express a bězí na Node.js
  
  - Authorizace a authentikace uživatelů pomocí jwt  
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
    
  
## EN

### General Information
This project represents the backend to the Živé Teplice web application. This web application serves as a space for the presentation and administration of the Živé Teplice cultural event. This backend enables:

  - User authorization and authentication using jwt tokens and HttpOnly Cookies
  - User registration
  - Inserting, editing and deleting posts and updates
  - Creating photo galleries and uploading images
  
### Tech Stack
  - Backend is written in javascriptu using Express framwork under Node.js  
  
- User authorization and authentication with jwt
    - jsonwebtoken: 8.5.1
    - passport: 0.5.0
    - passport-jwt: 4.0.0
    - passport-local: 1.0.0
    
- Data is stored in a MongoDB database
  - mongoose: 6.0.13
    
- Photos are stored in an AWS S3 Bucket
  - aws-sdk: 2.1035.0
  - multer: 1.4.3
  - multer-s3: 2.10.0
    
- Frontend is written in javascript using the React library and the Next.js framework
  - code is avaiblable [here](https://github.com/fialajiri/zive-teplice-frontend)
  
