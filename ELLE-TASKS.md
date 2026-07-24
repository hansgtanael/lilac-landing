# Elle's requests — master list

Compiled 2026-07-14 from every email from elle@wearetrademark.com. Status legend:
DONE = applied to the site (v2 code/CMS) · PENDING = needs an asset or a decision · WAITING ON HANS/ELLE = noted below.

## 1. Revisions/Comments for Lilac Landing (Jul 9)

- [x] DONE - Hero tagline: "Private dock, sunset views, 3 bedrooms + Family Room, 8 guests"
- [x] DONE - Rename TV Lounge to "Family Room"
- [x] DONE - Rename Queen Room to "King Room w/ en suite full bathroom"
- [x] DONE - Rename Bunk Room to "Twin Room"
- [x] DONE - 8 Guests Max everywhere (stat, booking selector, max note)
- [x] DONE - "4 Beds + King Sofa bed in Family Room": added "King sofa bed in Family Room" to What's Included (stats stay 3 BR / 4 beds / 2.5 baths / 8 guests)
  - Note: her email said "2 Bedrooms" but her own hero line and the Jul 13 long description both say "3 bedrooms plus a family room" - kept 3.
- [~] MOSTLY DONE - Gallery: her 19-caption list applied to The Property gallery (captions + order + omitting redundant living/dining shots). See section 6 for the two photos that are still pending.
- [ ] PENDING (photo files) - Her 3 attached photos: IMG_5150.jpeg, IMG_5154.HEIC, IMG_5159.jpeg (new exteriors: from the dock / from the street). I cannot download Gmail attachments from this session. HANS: save them from the Jul 9 email into lilac-landing-v2/public/figma/ (convert the HEIC to JPG) and I will slot them into gallery positions 2 and 18.

## 2. QR Code please (Jul 10 + Jul 13 follow-up)

- [x] DONE - One QR code pointing to https://lilaclanding.com, print quality for the physical sign:
  - assets/qr/lilaclanding-qr.svg (vector, for the sign printer)
  - assets/qr/lilaclanding-qr-2048.png (brand charcoal)
  - assets/qr/lilaclanding-qr-black-2048.png (pure black)
  - High error correction (H) so it scans even on a weathered sign. Verified renders correctly.
- [ ] WAITING ON HANS - email the files to Elle.

## 3. A sunny pic of the street entrance (Jul 12)

- [ ] PENDING (photo file) - attachment IMG_5179.jpeg (sunny street entrance). Same as above: save into public/figma/ and it becomes gallery #18 "Lilac Landing from the street and parking" (better light than the Jul 9 street shot - use this one).

## 4. Long description (Jul 13)

- [x] DONE - Booking section body updated with her effusive copy (year-round, picture windows, 3 BR + family room, 2.5 baths, gourmet kitchen, deck/dock/beach, 4.5 mi south of Penn Yan).
- [x] DONE - What's Included enriched from the description: Gas BBQ grill, Wood-burning fireplace, Heating and A/C, Two kayaks + life vests, Laundry room, King sofa bed in Family Room.
- [x] DONE (Jul 14) - Hans decided: the full description is now its own "About the House" section (components/AboutHouse.tsx, content: text.about) directly under The House gallery. Her text near-verbatim, structured as Main Floor / Upper Level / Outdoors, editable in /cms.
- [x] RESOLVED (Jul 14) - Naming discrepancy: Hans decided to keep the Jul 9 naming (King w/ en suite DOWNSTAIRS, Primary upstairs). The About section text was flipped accordingly (the only deviation from her Jul 13 wording).

## 5. pics from contractor! (Jul 14 - unread until today)

- [ ] WAITING ON HANS + ELLE - 76 professional photos in a Google Photos album (link in the email). Elle's questions: the pro batch is cooler in color than her warm phone pics - swap wholesale (fewer wide angles, add architectural details + window views), or mix?
  - She asked "Thoughts?" and "let me know if you can download" - she is waiting on a reply.
  - Suggested reply angle: the pro photos will look far more premium; pick ~20 favorites, keep her warm sunset shots for hero/atmosphere moments; I can color-grade the pro batch warmer to match the brand if needed.
  - Once downloaded into public/figma/ (or a new folder), the CMS at /cms makes swapping them trivial.

## 6. Gallery caption plan (from Jul 9, applied Jul 14)

Elle's numbered list mapped to files - see content/content.json property.photos for the live order.
Positions 2 ("from the dock") and 18 ("from the street and parking") are placeholders pending the attachment photos above.

## Full long description (for placement decision)

Welcome to Lilac Landing!

This year-round East side lake home (2300~ SF) is the perfect lakeside retreat for couples and families to experience Lake Life. Our newly built custom home has huge picture windows on both floors with incredible views of Keuka Lake. The sunsets are spectacular. Street level entrance to upstairs with 2 parking spaces adjacent to the house. Lilac Landing features 2 floors, 3 bedrooms plus a huge family room, 2.5 baths, gourmet kitchen, laundry room, deck, shady yard, dock and beach. Lilac Landing is located right on the water, just 4.5 miles South of Penn Yan. This is a quiet stretch of lower East Lake Road with wonderful neighbors and premium renovated and historic cottages.

MAIN FLOOR
The main floor (ground floor) of the house is designed for guests to enjoy views of the lake. The Great Room is a beautifully furnished living room with central dining area and gourmet kitchen. Kitchen and pantry are outfitted with induction range, drinks fridge, Bosch dishwasher, coffee maker, microwave, toaster and stocked with cooking pots and pans, utensils and plates and glassware. Utility and laundry room are off the kitchen pantry with doors to keep it quiet.

Watch the game on the Samsung Frame TV while you're entertaining (or go to art mode). A small wood burning fireplace will warm the fall evenings and the entire house features heating and A/C for year-round comfort.

The primary bedroom on the ground floor is a quiet retreat with en suite full bathroom. The main floor of the house also has a powder room (half bath) for guests to change and jump in the lake.

UPPER LEVEL
The large, upper level includes a king bedroom and a large family room both spectacular lake views. The family room (16'4" x 16'4") has a king sized pull out premium sofa bed and 75" LCD TV for movie nights, as well as a custom 2" thick walnut barn door for privacy. The king bedroom (15' x 16'4") is luxuriously appointed with a giant picture window to wake up to in the morning. All rooms have darkening and scrim shades on the windows.

Also on the upper level are a spacious twin bedroom with plenty of closet and dresser storage, plus a shared full bathroom with a shower and tub for soaking baths or bath time for kids.

A new, aluminum dock and lounge chairs are available for your use, as well as two kayaks (use at your own risk), and four life preservers of various sizes. The deck (325'~ SF) is fully furnished with 2 lounge chairs and matching couch and love seat as well as 3 umbrellas for shade. A gas barbecue grill is provided for outdoor cooking and entertaining.

We have built this house for maximum enjoyment of the lake. We look forward to welcoming you to Lilac Landing!
