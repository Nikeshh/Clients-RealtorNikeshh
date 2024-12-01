import * as cheerio from 'cheerio';
import puppeteer from 'puppeteer';
import axios from 'axios';

interface ScrapedProperty {
  title: string;
  address: string;
  price: number;
  type: string;
  listingType: 'SALE' | 'RENTAL';
  bedrooms?: number;
  bathrooms?: number;
  area: number;
  description?: string;
  features: string[];
  images: string[];
  location: string;
  yearBuilt?: number;
}

class PropertyScraper {
  private static async getPageContent(url: string): Promise<string> {
    // For sites requiring JavaScript rendering
    if (url.includes('zillow.com') || url.includes('realtor.ca')) {
      const browser = await puppeteer.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      
      const page = await browser.newPage();
      
      // Set a longer timeout and handle realtor.ca specifically
      if (url.includes('realtor.ca')) {
        await page.setDefaultNavigationTimeout(60000); // 60 seconds timeout
        await page.goto(url, { waitUntil: 'networkidle0' });
        
        // Wait for any of these selectors to appear
        try {
          await Promise.race([
            page.waitForSelector('[data-testid="listing-price"]'),
            page.waitForSelector('.listingDetailsContent'),
            page.waitForSelector('.propertyDetails'),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout waiting for content')), 45000)
            )
          ]);
        } catch (error) {
          console.warn('Warning: Some selectors not found, continuing with available content');
        }
      } else {
        await page.goto(url, { waitUntil: 'networkidle0' });
      }
      
      const content = await page.content();
      await browser.close();
      return content;
    }
    
    // For static sites
    const response = await axios.get(url);
    return response.data;
  }

  static async scrapeProperty(url: string): Promise<ScrapedProperty> {
    const content = await this.getPageContent(url);
    const $ = cheerio.load(content);

    // Determine which website we're scraping
    if (url.includes('realtor.ca')) {
      return this.scrapeRealtorCA($);
    } else if (url.includes('realtor.com')) {
      return this.scrapeRealtorDotCom($);
    } else if (url.includes('zillow.com')) {
      return this.scrapeZillow($);
    } else if (url.includes('trulia.com')) {
      return this.scrapeTrulia($);
    }

    throw new Error('Unsupported website');
  }

  private static scrapeRealtorCA($: cheerio.CheerioAPI): ScrapedProperty {
    // Price selectors - realtor.ca uses specific classes for price
    const priceText = $('.propertyDetails .listingPrice').text() || 
                     $('.propertyDetails span[data-testid="listing-price"]').text() ||
                     $('.propertyDetails .price').text();

    // Address selectors
    const addressText = $('.propertyAddress').text() || 
                       $('[data-testid="listing-address"]').text() ||
                       $('.address-bar').text();

    // Description selectors
    const descriptionText = $('.propertyDescription').text() || 
                           $('[data-testid="listing-description"]').text() ||
                           $('.description').text();

    // Features selectors
    const features: string[] = [];
    $('.propertyDetailsSectionContentFeatures li, .features li, [data-testid="listing-features"] li').each((_, el) => {
      const feature = $(el).text().trim();
      if (feature) features.push(feature);
    });

    // Images - realtor.ca uses data-src for lazy loading
    const images: string[] = [];
    $('.propertyImage img, .thumbnail img, [data-testid="listing-photos"] img').each((_, el) => {
      const src = $(el).attr('data-src') || $(el).attr('src');
      if (src && !src.includes('placeholder') && !images.includes(src)) {
        images.push(src);
      }
    });

    // Extract specs from various possible locations
    const specsText = $('.propertyDetailsSectionContentSpecs').text() || 
                     $('.propertySpecs').text() || 
                     $('.specs').text();

    // Parse bedrooms and bathrooms
    const bedroomsMatch = specsText.match(/(\d+)\s*(?:bed|bedroom|Bed|Bedroom)/i);
    const bathroomsMatch = specsText.match(/(\d+)\s*(?:bath|bathroom|Bath|Bathroom)/i);
    const areaMatch = specsText.match(/(\d+(?:,\d+)?)\s*(?:sq\s*ft|sqft|square\s*feet|Square\s*Feet)/i);

    // Determine if it's a rental
    const isRental = specsText.toLowerCase().includes('rent') || 
                    specsText.toLowerCase().includes('lease') ||
                    priceText.toLowerCase().includes('/month');

    // Clean up and parse the price
    const price = this.parsePrice(priceText);

    // Get location/neighborhood
    const location = $('.propertyNeighborhood').text() || 
                    $('[data-testid="listing-neighborhood"]').text() || 
                    $('.neighborhood').text();

    // Get property type
    const typeText = $('.propertyType').text() || 
                    $('[data-testid="listing-type"]').text() || 
                    $('.type').text();

    // Try to get year built
    const yearBuiltMatch = specsText.match(/(?:built|Built|Year|year).*?(\d{4})/);

    return {
      title: addressText.trim(),
      address: addressText.trim(),
      price,
      type: typeText.trim() || 'House',
      listingType: isRental ? 'RENTAL' : 'SALE',
      bedrooms: bedroomsMatch ? parseInt(bedroomsMatch[1], 10) : undefined,
      bathrooms: bathroomsMatch ? parseInt(bathroomsMatch[1], 10) : undefined,
      area: areaMatch ? parseInt(areaMatch[1].replace(',', ''), 10) : 0,
      description: descriptionText.trim(),
      features,
      images,
      location: location.trim(),
      yearBuilt: yearBuiltMatch ? parseInt(yearBuiltMatch[1], 10) : undefined,
    };
  }

  private static scrapeRealtorDotCom($: cheerio.CheerioAPI): ScrapedProperty {
    return {
      title: $('.PropertyHeading__PropertyAddress').text().trim(),
      address: $('.PropertyHeading__PropertyAddress').text().trim(),
      price: this.parsePrice($('[data-testid="price"]').text()),
      type: $('.PropertyType').text().trim() || 'House',
      listingType: $('.PropertyType').text().includes('Rent') ? 'RENTAL' : 'SALE',
      bedrooms: parseInt($('[data-testid="property-meta-beds"]').text(), 10) || undefined,
      bathrooms: parseInt($('[data-testid="property-meta-baths"]').text(), 10) || undefined,
      area: parseInt($('[data-testid="property-meta-sqft"]').text().replace(/\D/g, ''), 10),
      description: $('.PropertyDescription').text().trim(),
      features: $('.PropertyFeatures li').map((_, el) => $(el).text().trim()).get(),
      images: $('[data-testid="property-image-gallery"] img').map((_, el) => $(el).attr('src')).get(),
      location: $('.PropertyLocation').text().trim(),
      yearBuilt: parseInt($('.PropertyDetails [data-testid="property-year-built"]').text(), 10) || undefined,
    };
  }

  private static scrapeZillow($: cheerio.CheerioAPI): ScrapedProperty {
    return {
      title: $('.ds-address-container').text().trim(),
      address: $('.ds-address-container').text().trim(),
      price: this.parsePrice($('.ds-price').text()),
      type: $('.ds-home-facts-and-features .ds-home-fact-list-item:first').text().trim() || 'House',
      listingType: $('.ds-status-details').text().includes('Rent') ? 'RENTAL' : 'SALE',
      bedrooms: parseInt($('[data-testid="bed-bath-item"] .ds-bed-bath-living-area').text(), 10) || undefined,
      bathrooms: parseInt($('[data-testid="bed-bath-item"] .ds-bed-bath-living-area').eq(1).text(), 10) || undefined,
      area: parseInt($('.ds-bed-bath-living-area').last().text().replace(/\D/g, ''), 10),
      description: $('.ds-overview-section .ds-expandable-card-section').text().trim(),
      features: $('.ds-home-facts-and-features li').map((_, el) => $(el).text().trim()).get(),
      images: $('.media-stream-tile img').map((_, el) => $(el).attr('src')).get(),
      location: $('.ds-neighborhood').text().trim(),
      yearBuilt: parseInt($('.ds-home-fact-list span:contains("Year built")').next().text(), 10) || undefined,
    };
  }

  private static scrapeTrulia($: cheerio.CheerioAPI): ScrapedProperty {
    return {
      title: $('[data-testid="home-details-summary-address"]').text().trim(),
      address: $('[data-testid="home-details-summary-address"]').text().trim(),
      price: this.parsePrice($('[data-testid="home-details-price-container"]').text()),
      type: $('[data-testid="home-details-summary-property-type"]').text().trim() || 'House',
      listingType: $('[data-testid="home-details-summary-type"]').text().includes('Rent') ? 'RENTAL' : 'SALE',
      bedrooms: parseInt($('[data-testid="home-details-summary-beds"]').text(), 10) || undefined,
      bathrooms: parseInt($('[data-testid="home-details-summary-baths"]').text(), 10) || undefined,
      area: parseInt($('[data-testid="home-details-summary-floorspace"]').text().replace(/\D/g, ''), 10),
      description: $('[data-testid="home-description"]').text().trim(),
      features: $('[data-testid="home-features"] li').map((_, el) => $(el).text().trim()).get(),
      images: $('[data-testid="home-photos"] img').map((_, el) => $(el).attr('src')).get(),
      location: $('[data-testid="home-details-summary-region"]').text().trim(),
      yearBuilt: parseInt($('[data-testid="home-details-summary-year-built"]').text(), 10) || undefined,
    };
  }

  private static parsePrice(priceText: string): number {
    // Enhanced price parsing for realtor.ca format
    const text = priceText.toLowerCase().trim();
    
    // Remove currency symbols, commas and whitespace
    let cleanText = text.replace(/[,$€£\s]/g, '');
    
    // Handle price ranges (take the lower price)
    if (cleanText.includes('-')) {
      cleanText = cleanText.split('-')[0];
    }
    
    // Handle price formats
    if (text.includes('k')) {
      return parseFloat(cleanText.replace(/k/i, '')) * 1000;
    }
    if (text.includes('m')) {
      return parseFloat(cleanText.replace(/m/i, '')) * 1000000;
    }
    
    // Handle monthly rental prices
    if (text.includes('/month') || text.includes('per month')) {
      cleanText = cleanText.replace(/\/month|permonth/i, '');
    }
    
    // Handle "from" prices
    if (text.includes('from')) {
      cleanText = cleanText.replace(/from/i, '');
    }
    
    // Parse the final number
    const number = parseFloat(cleanText.replace(/[^\d.]/g, ''));
    return isNaN(number) ? 0 : number;
  }
}

export default PropertyScraper; 