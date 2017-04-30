import * as Chai from "chai";

export namespace JsonLD {
   import Property = Chai.Property;
   /**
    * http://schema.org/Action
    */
   interface Action extends Thing {
      actionStatus: ActionStatusType
      agent: Person|Organization,
      participant: Person|Organization,
      endTime: Date,
      error: Thing,
      instrument: Thing,
      location: Place|PostalAddress|string,
      object: Thing,
      result: Thing,
      startTime: Date,
      target: EntryPoint
   }

   /**
    * http://schema.org/ActionStatusType
    */
   interface ActionStatusType extends Thing {}

   /**
    * http://schema.org/AdministrativeArea
    */
   interface AdministrativeArea extends Place {}

   interface AggregateRating extends Rating {
      itemReviews: Thing,
      ratingCount: number,
      reviewCount: number
   }

   /**
    * http://schema.org/Article
    */
   interface Article extends CreativeWork {
      articleBody: string,
      articleSection: string,
      pageStart: string|number,
      pageEnd: string|number,
      pagination: string,
      wordCount: number
   }

   /**
    * http://schema.org/Audience
    */
   interface Audience extends Thing {
      audienceType: string,
      geographicArea: AdministrativeArea
   }

   /**
    * http://schema.org/Blog
    */
   interface Blog extends Thing {
      blogPost: BlogPosting[]
   }

   /**
    * http://schema.org/BlogPosting
    */
   interface BlogPosting extends SocialMediaPosting {}

   /**
    * http://schema.org/Brand
    */
   interface Brand extends Thing {
      aggregateRating: AggregateRating,
      review: Review,
      logo: string
   }

   /**
    * http://schema.org/Breadcrumb
    */
   interface Breadcrumb extends Thing {}

   /**
    * http://schema.org/BreadcrumbList
    */
   interface BreadcrumbList extends ItemList<Breadcrumb> {}

   /**
    * http://schema.org/BusinessEntityType
    */
   interface BusinessEntityType extends Thing {}

   /**
    * http://schema.org/BusinessFunction
    */
   interface BusinessFunction extends Thing {}

   /**
    * http://schema.org/Comment
    */
   interface Comment extends CreativeWork {
      downvoteCount: number,
      upvoteCount: number
   }

   /**
    * http://schema.org/Country
    */
   interface Country extends Place {}

   /**
    * http://schema.org/CreativeWork
    */
   interface CreativeWork extends Thing {
      author?: Person|Organization,
      creator?: Person|Organization,
      provider?: Person|Organization,
      producer?: Person|Organization,
      sourceOrganization?: Organization,
      editor?: Person,
      associatedArticle?: NewsArticle,
      requiresSubscription?: boolean,
      contentSize?: string,
      contentUrl?: URL|string,
      encodingFormat?: string,
      bitrate?: string,
      duration?: Duration,
      height?: Distance|QuantitativeValue|number,
      width?: Distance|QuantitativeValue|number,
      productionCompany?: Organization,
      regionsAllowed?: Place,
      copyrightHolder?: Person|Organization,
      copyrightYear?: number,
      audience?: Audience,
      encoding?: MediaObject,
      hasPart?: CreativeWork,
      isPartOf?: CreativeWork,
      headling?: string,
      keywords?: string,
      locationCreated?: Place,
      review?: Review,
      datePublished?: DateTime,
      text?: string,
      version?: number,
      mainEntity?: Thing,
      thumbnailUrl?: string
   }

   interface ContactPoint extends Thing {
      areaServed: AdministrativeArea|GeoShape|Place|string,
      availableLanguage: Language|string,
      contactOption: ContactPointOption,
      contactType: string,
      email: string,
      faxNumber: string,
      hoursAvailable: OpeningHoursSpecification,
      productSupported: Product|string,
      telephone: string
   }

   /**
    * http://schema.org/ContactPointOption
    */
   interface ContactPointOption extends Thing {}

   /**
    * http://schema.org/GeoCoordinates
    */
   interface Coordinates extends Thing {
      elevation: string|number,
      latitude: string|number,
      longitude: string|number,
      postalCode: string
   }

   /**
    * http://schema.org/DateTime
    * https://en.wikipedia.org/wiki/ISO_8601
    */
   interface DateTime extends Thing {}

   /**
    * http://schema.org/DayOfWeek
    */
   interface DayOfWeek extends Thing {}

   /**
    * http://schema.org/DeliveryMethod
    */
   interface DeliveryMethod extends Thing {
      method: {
         directDownload: 'http://purl.org/goodrelations/v1#DeliveryModeDirectDownload',
         freight: 'http://purl.org/goodrelations/v1#DeliveryModeFreight ',
         mail: 'http://purl.org/goodrelations/v1#DeliveryModeMail',
         ownFleet: 'http://purl.org/goodrelations/v1#DeliveryModeOwnFleet',
         pickUp: 'http://purl.org/goodrelations/v1#DeliveryModePickUp',
         DHL: 'http://purl.org/goodrelations/v1#DHL',
         federalExpress: 'http://purl.org/goodrelations/v1#FederalExpress',
         UPS: 'http://purl.org/goodrelations/v1#UPS'
      }
   }

   /**
    * http://schema.org/Demand
    */
   interface Demand extends Thing {
      acceptedPaymentMethod: LoanOrCredit|PaymentMethod,
      advancedBookingRequirement: QuantitativeValue,
      areaServed: AdministrativeArea|GeoShape|Place|string,
      availability: ItemAvailability,
      availabilityEnds: Date,
      availabilityStarts: Date,
      availableAtOrFrom: Place,
      availableDeliveryMethod: DeliveryMethod,
      businessFunction: BusinessFunction,
      deliveryLeadTime: QuantitativeValue,
      eligibleCustomerType: BusinessEntityType,
      eligibleDuration: QuantitativeValue,
      eligibleQuantity: QuantitativeValue,
      eligibleRegion: GeoShape|Place|string,
      eligibleTransactionVolume: PriceSpecification,
      gtin12: string,
      gtin13: string,
      gtin14: string,
      gtin8: string,
      includesObject: TypeAndQuantityNode,
      ineligibleRegion: GeoShape|Place|Text,
      inventoryLevel: QuantitativeValue,
      itemCondition: OfferItemCondition,
      itemOffered: Product|Service,
      mpn: string,
      priceSpecification: PriceSpecification,
      seller: Organization|Person,
      serialNumber: string,
      sku: string,
      validFrom: Date,
      validThrough: Date,
      warranty: WarrantyPromise
   }

   /**
    * http://schema.org/DiscussionForumPosting
    */
   interface DiscussionForumPosting extends SocialMediaPosting {}

   /**
    * http://schema.org/Distance
    */
   interface Distance extends Thing {}

   /**
    * http://schema.org/Duration
    */
   interface Duration extends Thing {}

   /**
    * http://schema.org/EducationalOrganization
    */
   interface EducationalOrganization extends Organization {
      alumni: Person[]
   }

   interface EntryPoint extends Thing {
      actionApplication: SoftwareApplication,
      actionPlatform: string|URL,
      contentType: string,
      encodingType: string,
      httpMethod: string,
      urlTemplate: string
   }

   /**
    * http://schema.org/Enumeration
    */
   interface Enumeration extends Thing {}

   /**
    * http://schema.org/Event
    */
   interface Event extends Thing {
      actor: Person,
      aggregateRating: AggregateRating,
      attendee: Person[]|Organization[],
      composer: Person|Organization,
      contributor: Person[]|Organization[],
      director: Person,
      doorTime: Date,
      duration: Duration,
      endDate: Date,
      eventStatus: EventStatusType,
      funder: Organization|Person,
      inLanguage: Language|string,
      isAccessibleForFree: boolean,
      location: Place|PostalAddress|string,
      offers: Offer[],
      organizer: Person|Organization,
      performer: Person|Organization,
      previousStartDate: Date,
      recordedIn: CreativeWork,
      review: Review,
      sponsor: Person|Organization,
      startDate: Date,
      subEvent: Event,
      superEvent: Event,
      translator: Person|Organization,
      typicalAgeRange: string,
      workFeatured: CreativeWork
      workPerformed: CreativeWork
   }

   /**
    * http://schema.org/EventStatusType
    */
   interface EventStatusType extends Thing {}

   /**
    * http://schema.org/FinancialProduct
    */
   interface FinancialProduct extends Service {
      annualPercentageRate: number|QuantitativeValue,
      feesAndCommissionsSpecification: string|URL,
      interestRate: number|QuantitativeValue
   }

   /**
    * http://schema.org/GenderType
    */
   interface GenderType extends Thing {}

   /**
    * http://schema.org/GeoCoordinates
    */
   interface GeoCoordinates extends Thing {
      address: PostalAddress|string,
      addressCountry: Country|string,
      elevation: number|string,
      latitude: number|string,
      longitude: number|string,
      postalCode: string
   }

   interface GeoShape extends Thing {
      address: PostalAddress|string,
      addressCountry: Country|string,
      box: string,
      circle: string,
      elevation: string|number,
      line: string,
      polygon: string,
      postalCode: string
   }

   /**
    * http://schema.org/ImageObject
    */
   interface ImageObject extends MediaObject {
      caption?: string,
      exifData?: PropertyValue|string,
      representativeOfPage?: boolean,
      thumbnail?: ImageObject
   }

   /**
    * http://schema.org/ItemAvailability
    */
   interface ItemAvailability extends Thing {}

   /**
    * http://schema.org/ItemList
    */
   interface ItemList<T extends Thing> extends Thing {
      itemListElement: ListItem<T>[]|string[]|Thing[],
      itemListOrder: ItemListOrderType|string
      numberofItems: number
   }

   /**
    * http://schema.org/ItemListOrderType
    */
   interface ItemListOrderType extends Thing {}

   /**
    * http://schema.org/Language
    */
   interface Language extends Thing {}

   /**
    * http://schema.org/ListItem
    */
   interface ListItem<T extends Thing> extends Thing {
      item: T,
      nextItem: ListItem<T>,
      position: number|string,
      previousItem: ListItem<T>
   }

   /**
    * http://schema.org/LoanOrCredit
    */
   interface LoanOrCredit extends FinancialProduct {
      amount: MonetaryAmount|number,
      loanTerm: QuantitativeValue,
      requiredCollateral: Thing|string
   }

   /**
    * http://schema.org/LocationFeatureSpecification
    */
   interface LocationFeatureSpecification extends PropertyValue {
      hoursAvailable: OpeningHoursSpecification,
      validFrom: Date,
      validThrough: Date
   }

   interface MediaObject extends CreativeWork {
      embedUrl?: URL|string;
      encodesCreativeWork?: CreativeWork;
      expires?: Date;
      playerType?: string;
      productionCompany?: Organization;
      regionsAllowed?: Place;
      requiresSubscription?: boolean;
      uploadDate?: Date;
   }

   /**
    * http://schema.org/MonetaryAmount
    */
   interface MonetaryAmount extends Thing {
      currency: string,
      maxValue: number,
      minValue: number,
      validFrom: Date,
      validThrough: Date,
      value: boolean|number|StructuredValue|string
   }

   /**
    * http://schema.org/MusicAlbum
    */
   interface MusicAlbum extends CreativeWork {
      albumProductionType: MusicAlbumProductionType,
      albumRelease: MusicRelease,
      albumReleaseType: MusicAlbumReleaseType,
      byArtist: MusicGroup
   }

   /**
    * http://schema.org/MusicAlbumProductionType
    */
   interface MusicAlbumProductionType extends Thing {}

   /**
    * http://schema.org/MusicAlbumReleaseType
    */
   interface MusicAlbumReleaseType extends Thing {}

   /**
    * http://schema.org/MusicComposition
    */
   interface MusicComposition extends CreativeWork {
      composer: Person|Organization,
      firstPerformance: Event,
      includedComposition: MusicComposition,
      iswcCode: string,
      lyricist: Person,
      lyrics: CreativeWork,
      musicArrangement: MusicComposition,
      musicCompositionForm: string,
      musicalKey: string,
      recordedAs: MusicRecording
   }

   /**
    * http://schema.org/MusicGroup
    */
   interface MusicGroup extends Organization {
      album: MusicAlbum,
      genre: string|URL,
      track: ItemList<MusicRecording>|MusicRecording
   }

   /**
    * http://schema.org/MusicPlaylist
    */
   interface MusicPlaylist extends CreativeWork {
      numTracks: number,
      track: ItemList<MusicRecording>|MusicRecording
   }

   /**
    * http://schema.org/MusicRecording
    */
   interface MusicRecording extends CreativeWork {
      byArtist: MusicGroup,
      duration: Duration,
      inAlbum: MusicAlbum,
      inPlaylist: MusicPlaylist,
      isrcCode: string,
      recordingOf: MusicComposition
   }

   /**
    * http://schema.org/MusicRelease
    */
   interface MusicRelease extends MusicPlaylist {
      catalogNumber: string,
      creditedTo: Person|Organization,
      duration: Duration,
      musicReleaseFormat: MusicReleaseFormatType,
      recordLabel: Organization,
      realseOf: MusicAlbum
   }

   /**
    * http://schema.org/MusicReleaseFormatType
    */
   interface MusicReleaseFormatType extends Thing {}

   interface NewsArticle extends Article {
      dateline: string,
      printColumn: string,
      printEdition: string,
      printPage: string,
      printSelection: string
   }

   interface Offer extends Thing {
      acceptingPaymentMethod: LoanOrCredit|PaymentMethod,
      addOn: Offer,
      advancedBookingRequirement: QuantitativeValue,
      aggregateRating: AggregateRating,
      areaServiced: AdministrativeArea|GeoShape|Place|string,
      availability: ItemAvailability,
      availabilityEnds: Date,
      availabilityStarts: Date,
      availableAtOrFrom: Place,
      availableDeliveryMethod: DeliveryMethod,
      businessFunction: BusinessFunction,
      category: Thing|string,
      deliveryLeadTime: QuantitativeValue,
      eligibleCustomerType: BusinessEntityType,
      eligibleDuration: QuantitativeValue,
      eligibleQuantity: QuantitativeValue,
      eligibleRegion: GeoShape|Place|string,
      eligibleTransactionVolume: PriceSpecification,
      gtin12: string,
      gtin13: string,
      gtin14: string,
      gtin8: string,
      includesObject: TypeAndQuantityNode,
      ineligibleRegion: GeoShape|Place|string,
      inventoryLevel: QuantitativeValue,
      itemCondition: OfferItemCondition,
      itemOffered: Product|Service,
      mpn: string,
      offeredBy: Organization|Person,
      price: number|string,
      priceCurrency: string,
      priceSpecification: PriceSpecification,
      priceValidUntil: Date,
      review: Review,
      seller: Organization|Person,
      serialNumber: string,
      sku: string,
      validFrom: Date,
      validThrough: Date,
      warranty: WarrantyPromise
   }

   /**
    * http://schema.org/OfferCatalog
    */
   interface OfferCatalog extends ItemList<Offer> {}

   /**
    * http://schema.org/OfferItemCondition
    */
   interface OfferItemCondition extends Thing {}

   /**
    * http://schema.org/OpeningHoursSpecification
    */
   interface OpeningHoursSpecification extends Thing {
      closes: Date,
      dayOfWeek: DayOfWeek,
      opens: Date,
      validFrom: Date,
      validThrough: Date
   }

   /**
    * http://schema.org/Organization
    */
   interface Organization extends Thing {
      address: PostalAddress|string,
      aggregateRating: AggregateRating,
      alumni: Person[],
      areaServiced: AdministrativeArea|GeoShape|Place|string,
      award: string,
      brand: Brand|Organization,
      contactPoint: ContactPoint,
      department: Organization,
      dissolutionDate: Date,
      duns: string,
      email: string,
      employee: Person|Person[],
      event: Event,
      faxNumber: string,
      founder: Person|Person[],
      foundingDate: Date,
      foundingLocation: Place,
      funder: Organization|Person,
      globalLocationNumber: string,
      hasOfferCatalog: OfferCatalog,
      hasPOS: Place,
      isicV4: string,
      legalName: string,
      leiCode: string,
      location: Place|PostalAddress|string,
      logo: ImageObject|URL,
      makesOffer: Offer,
      member: Organization|Person,
      memberOf: Organization|Person,
      naics: string,
      numberOfEmployees: QuantitativeValue,
      owns: OwnershipInfo|Product,
      parentOrganization: Organization,
      review: Review,
      seeks: Demand,
      sponsor: Organization|Person,
      subOrganization: Organization,
      taxID: string,
      telephone: string,
      vatID: string
   }

   /**
    * http://schema.org/OwnershipInfo
    */
   interface OwnershipInfo extends Thing {
      acquiredFrom: Organization|Person,
      ownedFrom: Date,
      ownedThrough: Date,
      typeOfGood: Product|Service
   }

   /**
    * http://schema.org/PaymentMethod
    */
   interface PaymentMethod extends Thing {}

   /**
    * http://schema.org/Person
    */
   interface Person extends Thing {
      additionalName: string,
      addres: PostalAddress|string,
      affiliation: Organization,
      alumniOf: EducationalOrganization[]|Organization[],
      award: string,
      birthDate: string,
      birthPlace: Place,
      brand: Brand|Organization,
      children: Person[],
      colleague: Person|URL,
      contactPoint: ContactPoint,
      deathDate: Date,
      deathPlace: Place,
      duns: string,
      email: string,
      familyName: string,
      faxNumber: string,
      follows: Person[],
      funder: Organization|Person,
      gender: GenderType|string,
      givenName: string,
      globalLocationNumber: string,
      hasOfferCatalog: OfferCatalog,
      hasPOS: Place,
      height: Distance|QuantitativeValue,
      homeLocation: ContactPoint|Place,
      honorificPrefix: string,
      honorificSuffix: string,
      isicV4: string,
      jobTitle: string,
      knows: Person[],
      makesOffer: Offer,
      memberOf: Organization[]|ProgramMembership[],
      naics: string,
      nationality: Country,
      netWorth: MonetaryAmount|PriceSpecification,
      owns: OwnershipInfo[]|Product[],
      parent: Person[],
      performerIn: Event,
      relatedTo: Person[],
      seeks: Demand[],
      sibling: Person[],
      sponder: Organization|Person,
      spouse: Person,
      taxID: string,
      telephone: string,
      vatID: string,
      weight: QuantitativeValue,
      workLocation: ContactPoint|Place,
      worksFor: Organization
   }

   /**
    * http://schema.org/Photograph
    */
   interface Photograph extends CreativeWork {}

   interface Place extends Thing {
      additionalProperty: PropertyValue,
      address: PostalAddress|string,
      aggregateRating: AggregateRating,
      amenityFeature: LocationFeatureSpecification,
      branchCode: string,
      containedInPlace: Place,
      containsPlace: Place,
      event: Event,
      faxNumber: string,
      geo: GeoCoordinates|GeoShape,
      globalLocationNumber: string,
      hasMap: Map<string, URL>|URL,
      isicV4: string,
      logo: ImageObject|URL,
      openingHoursSpecification: OpeningHoursSpecification,
      photo: ImageObject|Photograph,
      review: Review,
      smokingAllowed: boolean,
      specialOpeningHoursSpecification: OpeningHoursSpecification,
      telephone: string,
   }

   interface PostalAddress extends ContactPoint {
      addressCountry: Country|string,
      addressLocality: string,
      addressRegion: string,
      postOfficeBoxNumber: string,
      postalCode: string,
      streetAddress: string
   }

   /**
    * http://schema.org/PriceSpecification
    */
   interface PriceSpecification extends Thing {
      eligibleQuantity: QuantitativeValue,
      eligibleTransactionVolume: PriceSpecification,
      maxPrice: number,
      minPrice: number,
      price: number|string,
      priceCurrency: string,
      validFrom: Date,
      validThrough: Date,
      valueAddedTaxIncluded: boolean
   }

   /**
    * http://schema.org/ProgramMembership
    */
   interface ProgramMembership extends Thing {
      hostingOrganization: Organization,
      member: Organization|Person,
      membershipNumber: string,
      programName: string
   }

   interface Product extends Thing {
      additionalProperty: PropertyValue,
      aggregateRating: AggregateRating,
      audience: Audience,
      award: string,
      brand: Brand|Organization,
      category: string|Thing,
      color: string,
      depth: Distance|QuantitativeValue,
      gtin12: string,
      gtin13: string,
      gtin14: string,
      gtin8: string,
      height: Distance|QuantitativeValue,
      isAccessoryOrSparePart: Product,
      isConsumableFor: Product,
      isRelatedTo: Product|Service,
      itemCondition: OfferItemCondition,
      logo: ImageObject|URL,
      manufacturer: Organization,
      model: ProductModel|string,
      mpn: string,
      offers: Offer,
      productID: string,
      productionDate: Date,
      purchaseDate: Date,
      releaseDate: Date,
      review: Review,
      sku: string,
      weight: QuantitativeValue,
      width: Distance|QuantitativeValue
   }

   /**
    * http://schema.org/ProductModel
    */
   interface ProductModel extends Product {
      isVariantOf: ProductModel,
      predecessorOf: ProductModel,
      successorOf: ProductModel
   }

   interface PropertyValue extends Thing {
      maxValue: number,
      minValue: number,
      propertyID: string|URL,
      unitCode: string|URL,
      unitText: string,
      value: boolean|number|StructuredValue|string,
      valueReference: Enumeration|PropertyValue|QualitativeValue|QuantitativeValue|StructuredValue
   }

   interface QualitativeValue extends Thing {
      additionalProperty: PropertyValue,
      equal: QualitativeValue,
      greater: QualitativeValue,
      greaterOrEqual: QualitativeValue,
      lesser: QualitativeValue,
      lesserOrEqual: QualitativeValue,
      nonEqual: QualitativeValue,
      valueReference: Enumeration|PropertyValue|QualitativeValue|QuantitativeValue|StructuredValue
   }

   interface QuantitativeValue extends Thing {
      additionalProperty: PropertyValue,
      maxValue: number,
      minValue: number,
      unitCode: string|URL,
      unitText: string,
      value: boolean|number|StructuredValue|string,
      valueReference: Enumeration|PropertyValue|QualitativeValue|QuantitativeValue|StructuredValue
   }

   /**
    * http://schema.org/Rating
    */
   interface Rating extends Thing {
      author: Organization|Person,
      bestRating: string|number,
      ratingValue: string|number,
      worstRating: string|number
   }

   /**
    * http://schema.org/Review
    */
   interface Review extends CreativeWork {
      itemReviewed: Thing,
      reviewBody: string,
      reviewRating: Rating
   }

   /**
    * http://schema.org/SearchAction
    */
   interface SearchAction extends Action {
      query: string
   }

   /**
    * http://schema.org/Service
    */
   interface Service extends Thing {
      aggregateRating: AggregateRating,
      areaServed: AdministrativeArea|GeoShape|Place|string,
      audience: Audience,
      availableChannel: ServiceChannel,
      award: string,
      brand: Brand|Organization,
      category: string|Thing,
      hasOfferCatalog: OfferCatalog,
      hoursAvailable: OpeningHoursSpecification,
      isRelatedTo: Product|Service,
      isSimilarTo: Product|Service,
      logo: ImageObject|URL,
      offers: Offer[],
      provider: Organization|Person,
      providerMobility: string,
      review: Review,
      serviceOutput: Thing,
      serviceType: string
   }

   /**
    * http://schema.org/ServiceChannel
    */
   interface ServiceChannel extends Thing {
      availableLanguage: Language,
      processingTime: Duration,
      providesService: Service,
      serviceLocation: Place,
      servicePhone: ContactPoint,
      servicePostalAddress: PostalAddress,
      serviceSmsNumber: ContactPoint,
      serviceURL: URL
   }

   /**
    * http://schema.org/SocialMediaPosting
    */
   interface SocialMediaPosting extends Article {
      sharedContent: CreativeWork
   }

   /**
    * http://schema.org/SoftwareApplication
    */
   interface SoftwareApplication extends Thing {
      applicationCategory: string,
      applicationSuite: string,
      downloadUrl: string,
      operatingSystem: string,
      softwareVersion: string
   }

   /**
    * http://schema.org/Specialty
    */
   interface Specialty extends Thing {}

   /**
    * http://schema.org/StructuredValue
    */
   interface StructuredValue extends Thing {}

   interface Thing {
      [key:string]: any;
      '@id'?: string;
      '@context'?: string;
      '@type'?: string;
      name?: string;
      description?: string;
      image?: ImageObject|string;
      alternateName?: string;
      additionalType?: URL;
      potentialAction?: Action;
      sameAs?: URL;
      mainEntityOfPage?: CreativeWork|URL;
      url?: URL|string;
   }

   /**
    * http://schema.org/TypeAndQuantityNode
    */
   interface TypeAndQuantityNode extends Thing {
      amountOfThisGood: number,
      businessFunction: BusinessFunction,
      typeOfGood: Product|Service,
      unitCode: string|URL,
      unitText: string
   }

   interface URL extends Thing {}

   /**
    * http://schema.org/VideoObject
    */
   interface VideoObject extends MediaObject {
      actor: Person,
      caption: string,
      director: Person,
      musicBy: MusicGroup,
      thumbnail: ImageObject,
      transcript: string,
      videoFrameSize: string,
      videoQuality: string,
   }

   /**
    * http://schema.org/WarrantyPromise
    */
   interface WarrantyPromise extends Thing {
      durationOfWarranty: QuantitativeValue,
      warrantyScope: WarrantyScope
   }

   /**
    * http://schema.org/WarrantyScope
    */
   interface WarrantyScope extends Thing {}

   /**
    * http://schema.org/WebPage
    */
   interface WebPage extends CreativeWork {
      breadcrumb?: BreadcrumbList|Breadcrumb[],
      lastReviewed?: Date,
      mainContentOfPage?: WebPageElement,
      primaryImageOfPage?: ImageObject,
      relatedLink?: URL[],
      reviewedBy?: Person|Organization,
      significantLink?: URL,
      specialty?: Specialty
   }

   /**
    * http://schema.org/WebPageElement
    */
   interface WebPageElement extends CreativeWork {}

   /**
    * http://schema.org/WebSite
    */
   interface WebSite extends CreativeWork {}
}
