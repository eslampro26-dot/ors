/**
 * Contract Generator with Electronic Signature
 * Generates the legal agreement with electronic signature details
 */

export function generateContract(bookingData, signatureData) {
  const {
    customer,
    email,
    phone,
    service,
    city,
    originalAmount,
    finalAmount,
    travelers,
    date,
    txId,
    paymentType
  } = bookingData;

  const {
    name,
    timestamp,
    userAgent,
    bookingDetails
  } = signatureData;

  const signatureDate = new Date(timestamp);
  const formattedDate = signatureDate.toLocaleDateString('ar-EG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const formattedTime = signatureDate.toLocaleTimeString('ar-EG', {
    hour: '2-digit',
    minute: '2-digit'
  });

  const contract = `
INTEGRATED MARKETING SERVICES AND TOURISM BROKERAGE AGREEMENT
Between:
ORLUXUS MARKETING AND BRANDING
(hereinafter referred to as the "Company")
And:
${customer} (email: ${email}, phone: ${phone})
(hereinafter referred to as the "Client")
───
ELECTRONIC SIGNATURE DETAILS
─────────────────────────────
Client Name: ${name}
Email: ${email}
Phone: ${phone}
Electronic Signature: ${name}
Signature Date: ${formattedDate}
Signature Time: ${formattedTime}
Timestamp: ${timestamp}
Transaction ID: ${txId}
Booking Details:
- Service: ${service}
- City: ${city}
- Date: ${date}
- Travelers: ${travelers}
- Original Amount: €${originalAmount}
- Final Amount: €${finalAmount}
- Payment Type: ${paymentType}
───
PREAMBLE
WHEREAS the Company operates in the field of electronic marketing and branding, and provides an electronic platform acting as a marketing and organizational broker between Clients and providers of tourism, entertainment, hospitality, transportation, and other services related to tourism and entertainment within and outside the Arab Republic of Egypt;
WHEREAS the Company expressly declares that it is not a licensed tourism company, does not provide tourism services itself, and only provides services within the limits of electronic marketing, brokerage between Clients and service providers, and the organization and coordination of bookings and activities;
WHEREAS the Client wishes to benefit from the Company's services through its electronic platforms;
NOW, THEREFORE, the Parties have agreed as follows:
───
PART ONE: GENERAL TERMS AND CONDITIONS
Article (1): Definition of the Company and Scope of Work
The Company is defined as a company operating in the field of marketing and branding, providing an electronic platform that acts as a marketing and organizational broker between Clients and providers of tourism, entertainment, hospitality, transportation, and other services related to tourism and entertainment within and outside the Arab Republic of Egypt.
The Company acknowledges and expressly declares that it is not a licensed tourism company, does not provide tourism services itself, and only provides its services within the following limits:
· Electronic marketing of tourism and entertainment services on behalf of service providers.
· Brokerage between Clients and service providers.
· Coordination of bookings and activities.
Article (2): Electronic Consent and Formation of Contract
First: Methods of Consent:
Upon the Client taking any of the following actions:
· Clicking the "I agree to the Terms and Conditions" button, or
· Clicking the "Complete Booking" or "Confirm Payment" button, or
· Completing the booking or payment process through the website, application, or any of the Company's payment methods,
Second: Effects of Consent:
This shall be deemed to constitute:
A final and legally binding electronic consent in accordance with the provisions of the Egyptian Electronic Signature Law No. 15 of 2004, whereby Article (14) of the Law stipulates that the legal validity of a contract may not be denied merely because it was concluded by electronic means.
1. An acknowledgment by the Client that they have read all the Terms and Conditions, Privacy Policy, and Risk Acknowledgment contained in this Agreement, understood them, and accepted them without reservation.
2. A valid electronic signature, and the electronic signature shall have the same legal validity as a written signature in accordance with the law regulating electronic transactions.
3. Explicit consent to the collection and processing of personal data in accordance with the attached Privacy Policy.
Third: Effectiveness of the Contract:
The Contract shall be deemed concluded and effective between the Client and the Company as of the moment the aforementioned electronic consent is given, and the Client may not withdraw from this Contract except in accordance with the conditions specified in the Cancellation and Refund Policy set forth in this Agreement.
Article (3): Nature of the Company's Work and Scope of Its Role
First: As a Broker and Marketing Organizer:
The Client acknowledges and agrees that the Company acts as a broker and booking organizer, and that its role is limited to:
· Marketing tourism and entertainment services through its electronic platforms.
· Organizing bookings and coordinating between the Client and service providers.
· Monitoring the quality of services provided by service providers.
· Providing technical support and customer service.
Second: Contractual Relationship:
In the case of services provided through external parties (such as hotels, transportation companies, cruise companies, islands and resorts, restaurants and cafes, entertainment activity companies, or any independent service providers), the direct contractual relationship arises between the Client and the primary service provider, and the responsibility for performing the service lies solely with the direct service provider. The Company shall not be a party to any contract between the Client and the service provider.
Third: Disclosure:
The Company expressly declares that it is not a licensed tourism company, does not provide any direct tourism services, and only provides marketing, brokerage, and organizational services.
Article (4): Company's Liability
First: Scope of Liability:
The Company's liability is limited to:
· Marketing services through its platforms.
· Organizing bookings and administrative coordination.
· Monitoring the quality of services provided by service providers.
· Providing technical support and customer service.
· Exercising reasonable care in selecting and promoting service providers.
Second: Limitations of Liability:
The Company shall not bear any liability for:
· Any default or breach by independent service providers.
· The quality or suitability of services provided by third parties.
· Any contractual obligations incumbent upon the service provider under the contract concluded between the Client and the service provider.
· Any damages or losses arising from services provided by service providers.
Third: Legal Basis of Liability:
The Company's liability is based on the provisions of the Egyptian Civil Code No. 131 of 1948, and does not exceed the scope of an obligation of means (marketing, organization, and coordination) and not an obligation of result (execution of the service itself).
Article (5): Disclaimer of Company Liability
The Company shall not bear any liability for damages or losses arising from:
1. Adverse weather conditions or exceptional climatic circumstances.
2. Natural disasters (earthquakes, floods, volcanic eruptions, etc.).
3. Closure of beaches, islands, or ports by decision of the competent authorities.
4. Governmental, security, or administrative decisions.
5. Delay or cancellation of means of transportation by operating companies.
6. Cancellation of activities by operating entities or service providers.
7. Injuries resulting from the Client's violation of safety instructions or reckless behavior.
8. Loss or theft of the Client's personal property.
9. Acts of third parties beyond the Company's control.
10. Force majeure events as provided for in the Egyptian Civil Code.
The Client acknowledges that they have been informed of these cases and agrees that the Company bears no liability in respect thereof.
Article (6): Client's Obligations and Liability
First: Client's Obligations:
The Client undertakes to:
1. Provide accurate and correct data and information when making a booking.
2. Comply with attendance times and specified times for activities and services.
3. Follow all safety instructions and instructions issued by service providers and the Company.
4. Respect Egyptian laws and the rules and regulations of tourism and entertainment establishments.
5. Not expose themselves or others to any danger.
6. Disclose any health conditions that may affect their safety during participation in activities.
Second: Client's Liability:
The Client alone bears full responsibility for:
· The legal and financial consequences resulting from their violation of any of the obligations stipulated in this Agreement.
· Any damage caused to third parties as a result of their conduct or negligence.
· Any additional costs arising from modification or cancellation of the booking due to their error.
Article (7): Injuries, Accidents, and Risks
First: Acknowledgment of Risks:
The Client acknowledges that tourism, entertainment, and marine activities may involve potential natural risks, including but not limited to: risks of drowning, sports injuries, exposure to weather conditions, and other risks associated with the nature of the activity.
Second: Participation at Personal Responsibility:
The Client agrees to participate in activities at their own personal responsibility after being informed of the nature of the activity and potential risks, and this shall be deemed a waiver of any claim against the Company in this regard.
Third: Cases of Non-Liability:
The Company shall not bear any liability for injuries or damages resulting from:
1. The Client's violation of safety instructions or guidance issued by guides or supervisors.
2. Reckless or irresponsible behavior on the part of the Client.
3. The Client providing incorrect health information or concealing a specific health condition.
4. Force majeure or circumstances beyond the Company's control.
Fourth: Recommendation for Insurance:
The Company recommends that the Client obtain a travel insurance policy covering medical risks, accidents, and cancellation, prior to the start of the trip.
Article (8): Cancellation and Refund Policy
First: Cancellation Provisions:
Cancellation and refund operations are subject to the specific terms of each service or service provider, and the Client shall be bound by the cancellation terms announced for each service at the time of booking, taking into account the provisions of the Consumer Protection Law No. 181 of 2018, which obligates the service supplier to refund its consideration or the consideration for the deficiency therein.
Second: Deductions:
The Company may deduct the following amounts from the value of the amount paid in the event of cancellation:
1. Banking fees and financial transfer fees.
2. The Company's administrative expenses.
3. Non-refundable amounts paid to service providers (hotels, airlines, etc.).
Third: Refund Procedures:
Refundable amounts shall be refunded within a reasonable period and by the same original payment method, provided that the Client bears any transfer fees or banking commissions arising from the refund process.
Article (9): Prices and Payment
First: Prices Subject to Modification:
All prices displayed on the website or application are estimated prices subject to modification prior to final booking confirmation, in cases of:
· Changes in exchange rates.
· Increases in service providers' costs.
· Imposition of new taxes or fees by governmental authorities.
Second: Booking Confirmation:
A booking shall not be considered confirmed and effective except after:
· Full payment or payment of the required deposit amount.
· The Client receives the electronic booking confirmation issued by the Company (Confirmation Voucher) via email or WhatsApp application, and this voucher shall be deemed evidence of completion of the booking.
Third: Payment Methods:
Payment shall be made through the methods approved by the Company, and the Client shall be responsible for any additional fees arising from the payment process.
Fourth: Additional Expenses:
Displayed prices do not generally include visa fees, insurance documents, or personal expenses (such as beverages, gifts, telephone calls, etc.), unless expressly stated otherwise.
Article (10): Program Modification
First: Right to Modify:
The Company reserves the right to modify the trip program, activity order, or schedule, in the following cases:
· Operational or logistical circumstances.
· Instructions from competent authorities.
· Force majeure circumstances.
Second: Notification:
The Company shall notify the Client of any material modifications prior to the trip date to the extent possible.
Third: Acceptance of Modification:
The Client's continuation with the trip after notification of the modification shall be deemed implied acceptance of the modification.
Article (11): Intellectual Property
First: Ownership of Content:
All content displayed on the website, application, or any platforms affiliated with the Company, including but not limited to: texts, images, logos, graphics, video clips, designs, and software, are the exclusive property of the Company or its licensors, and are protected by Egyptian and international intellectual property laws.
Second: Prohibition of Unauthorized Use:
The Client or any third party may not copy, modify, distribute, display, republish, transmit, or sell any of the website's content without obtaining prior written consent from the Company.
Third: Trademarks:
The Company's names, marks, trademarks, and logos are protected under trademark laws and may not be used without written permission.
Article (12): Governing Law
This Agreement shall be governed by and interpreted in accordance with the laws of the Arab Republic of Egypt, and in particular:
· Egyptian Civil Code No. 131 of 1948.
· Consumer Protection Law No. 181 of 2018.
· Electronic Signature Law No. 15 of 2004.
· Personal Data Protection Law No. 151 of 2020.
· Tourism Companies Regulation Law No. 38 of 1977 (with respect to service providers' obligations).
· Law Regulating Hotels and Tourist Establishments No. 8 of 2022.
Article (13): Dispute Resolution
First: Amicable Settlement:
The Parties shall first seek to settle amicably any dispute arising out of or relating to this Agreement within a period not exceeding thirty (30) days from the date one Party notifies the other of the existence of a dispute.
Second: Arbitration:
In the event amicable settlement is not reached, the dispute shall be referred to arbitration in accordance with the provisions of the Egyptian Arbitration Law No. 27 of 1994, before an arbitration tribunal composed of a single arbitrator agreed upon by the Parties, or two arbitrators (one appointed by each Party), who shall then select a third arbitrator.
Third: Place of Arbitration:
The place of arbitration shall be Cairo, and the language of arbitration shall be Arabic.
Fourth: Jurisdiction:
In the event arbitration cannot be resorted to for any reason, the courts of Cairo shall have exclusive jurisdiction to adjudicate the dispute.
Article (14): General Provisions
First: Severability:
If any competent court rules that any provision of this Agreement is invalid or unenforceable, that shall not affect the validity and enforceability of the remaining provisions.
Second: Non-Waiver:
Failure by either Party to enforce any right granted to it under this Agreement shall not be deemed a waiver of such right or of any other right.
Third: Amendments:
The Company reserves the right to amend this Agreement from time to time, and shall notify the Client of any material amendments via email or on the website.
Fourth: Language:
This Agreement is prepared in the Arabic language. In the event of a translation into any other language, the Arabic language shall be the authoritative language in the event of any conflict.
───
PART TWO: PRIVACY POLICY
Article (15): Definition of Personal Data
Personal Data shall be defined as any information relating to the Client that identifies or makes it possible to identify them, directly or indirectly, including but not limited to: name, email address, phone number, residential address, passport number, financial data, payment data, and personal preferences relating to tourism services.
Article (16): Legal Basis for Data Collection
The Company is committed to collecting and processing Client personal data in accordance with the provisions of:
· Personal Data Protection Law No. 151 of 2020 and its Executive Regulations No. 816 of 2025.
· Consumer Protection Law No. 181 of 2018.
· Telecommunications and Information Technology Regulation Law.
Article (17): Scope of Data Collection
First: Data Collected by the Company:
The Company collects the following data:
1. Identification Data: Name, date of birth, nationality, ID or passport number.
2. Contact Data: Email, phone number, address.
3. Payment Data: Credit card information or other payment methods.
4. Booking Data: Details of trips, activities, hotels, and transportation booked.
5. Technical Data: IP address, browser type, browsing history, geolocation data.
6. Personal Preferences: Tourism interests, special needs, health conditions (if disclosed).
Second: Data Sources:
Data is collected from:
· The Client directly when creating an account or making a booking.
· Interactions with the website or application.
· Other service providers (with the Client's consent).
· Social media (if the Client links their account).
Article (18): Purposes of Data Processing
The Company processes personal data for the following purposes:
1. Booking Management: Executing and managing bookings and requested services.
2. Communication: Responding to inquiries, sending booking confirmations, reminder notifications, and booking status updates.
3. Marketing: Sending special offers and promotions (with separate consent from the Client).
4. Service Improvement: Analyzing website and application usage to improve user experience.
5. Legal Compliance: Meeting legal and regulatory requirements.
6. Protection of Interests: Fraud prevention, protecting the security of the Client and the Company.
Article (19): Legal Basis for Processing
Data processing is based on one of the following legal bases:
1. Contract Performance: When processing data necessary for executing the booking and agreed services.
2. Consent: When obtaining explicit consent from the Client for specific purposes (such as marketing).
3. Legal Obligation: When processing data to comply with a legal obligation.
4. Legitimate Interest: When processing data for purposes relating to the Company's legitimate interest, provided it does not conflict with the Client's rights.
Article (20): Data Sharing with Third Parties
First: Cases of Sharing:
The Company may share personal data with:
1. Service Providers: Hotels, transportation companies, entertainment activity companies, and other service providers to execute bookings.
2. Payment Processors: Banks and payment processing companies to complete payment transactions.
3. Government Entities: When required by law or upon request from a judicial or regulatory authority.
4. Marketing Partners: With separate consent from the Client.
Second: Obligations of Receiving Parties:
The Company undertakes to conclude agreements with data-receiving parties ensuring their compliance with applicable data protection standards and that data is not used except for the specified purpose.
Article (21): Client's Data Rights
The Personal Data Protection Law grants the Client the following rights:
1. Right of Access: To obtain a copy of the personal data held.
2. Right to Rectification: To request correction of any inaccurate or incomplete data.
3. Right to Erasure: To request deletion of personal data in cases where it is no longer necessary for the purpose for which it was collected.
4. Right to Restriction of Processing: To request restriction of data processing in certain cases.
5. Right to Object: To object to the processing of data for direct marketing purposes.
6. Right to Withdraw Consent: To withdraw consent to data processing at any time.
7. Right to Data Portability: To request transfer of data to another service provider (where technically feasible).
Article (22): Data Retention and Security
First: Retention Period:
The Company retains personal data for the period necessary to achieve the purposes for which it was collected, or for the period required by law, whichever is longer.
Second: Security Measures:
The Company takes appropriate technical and organizational measures to protect data from:
· Unauthorized access.
· Unlawful modification or disclosure.
· Loss, destruction, or damage.
These measures include: encryption, firewalls, access control systems, and periodic review of security procedures.
Article (23): Data Breach Notification
In the event of any personal data breach that may pose a risk to the Client's rights and freedoms, the Company undertakes to:
1. Notify the Central Authority for Personal Data Protection within 72 hours of becoming aware of the breach.
2. Notify the affected Client within 3 business days from the date of notification to the competent authority.
3. Document all breach incidents and the measures taken to address them.
Article (24): Cookies
First: Use of Cookies:
The Company uses cookies and similar technologies to:
· Improve website and application performance.
· Remember Client preferences.
· Analyze website usage.
· Deliver personalized content and advertisements.
Second: Control of Cookies:
The Client can control cookies through browser settings, noting that disabling some cookies may affect website functionality.
Article (25): Cross-Border Data Transfers
In the event personal data is transferred outside the Arab Republic of Egypt (for example, when booking with service providers abroad), the Company undertakes to ensure an adequate level of data protection is available in accordance with Egyptian and international standards.
Article (26): Privacy Policy Updates
First: Right to Amend:
The Company reserves the right to amend this Policy from time to time.
Second: Notification:
The Company shall notify Clients of any material amendments via email or through a notice on the website.
Third: Effectiveness of Amendments:
Amendments shall be deemed effective after publication on the website, and the Client's continued use of the services shall be deemed acceptance of the amendments.
Article (27): Contacting the Data Protection Officer
For inquiries about the Privacy Policy or data protection practices, or to exercise their rights, the Client may contact the Company via:
· Email: info@orluxus.com
· Phone: +201038820014
───
PART THREE: DISCLAIMER AND RISK ACKNOWLEDGMENT
(Applicable to Marine and Recreational Activities)
Article (28): Definition of Scope
The provisions of this Acknowledgment shall apply to all recreational, marine, and sports activities organized or coordinated by the Company, including but not limited to:
· Marine trips, snorkeling, and swimming.
· Water activities (water skiing, paddling, surfing).
· Sports and recreational activities on islands and resorts.
· Land and mountain trips.
· Any other activities that may involve physical risks.
Article (29): Client's Acknowledgment of Risks
The Client acknowledges and agrees to the following:
First: Awareness of the Nature of Risks:
The Client has been informed that the aforementioned activities may involve natural and potential risks, including but not limited to:
· Risks of drowning or suffocation.
· Physical injuries (fractures, wounds, bruises, sprains).
· Exposure to weather conditions (sunstroke, hypothermia).
· Marine life risks (stings, bites, allergies).
· Risks of equipment and machinery used in activities.
· Risks of falling or collision.
· Any other risks associated with the nature of the activity.
Second: Participation at Personal Responsibility:
The Client agrees to participate in these activities at their own personal responsibility, having been given the opportunity to inquire about the nature of the activity and the associated risks.
Third: Physical Fitness:
The Client acknowledges that they possess sufficient physical and mental fitness to participate in the activity, and that they do not have any health conditions that might make participation unsafe for themselves or others.
Article (30): Disclaimer of Company Liability
First: Scope of Disclaimer:
The Client agrees that the Company, its directors, employees, agents, and partners, shall not bear any liability for:
· Any injuries, damages, or losses sustained by the Client or their property during participation in activities.
· Any death or permanent disability arising from participation in activities.
· Any illnesses or injuries resulting from exposure to environmental or natural factors.
· Any damages resulting from the use of equipment or facilities.
Second: Cases of Non-Liability:
The Company shall not bear any liability for injuries or damages resulting from:
1. The Client's violation of safety instructions or guidance issued by guides or supervisors.
2. Reckless or irresponsible behavior on the part of the Client.
3. The Client providing incorrect health information or concealing a specific health condition.
4. The Client's consumption of drugs or alcohol before or during the activity.
5. Force majeure or circumstances beyond the Company's control.
6. The Client's negligence towards their personal safety or the safety of others.
Article (31): Client's Obligations During the Activity
The Client undertakes during participation in activities to:
1. Follow all safety instructions and guidance issued by guides and supervisors.
2. Wear required safety equipment (life jackets, helmets, appropriate footwear, etc.).
3. Disclose any health conditions or medications they are taking that may affect their safety.
4. Refrain from consuming alcohol or drugs before and during the activity.
5. Immediately notify supervisors of any risks or emergencies.
6. Not expose themselves or others to any danger.
7. Respect the natural environment and marine life.
Article (32): Obligations of Activity Operators
The Client undertakes to follow the safety instructions issued by trainers and supervisors affiliated with service providers, and acknowledges that the Company has the right to prevent them from participating in any activity if it appears to the Company or the service provider that their participation poses a risk to their safety or the safety of others.
Article (33): Equipment
First: Client's Responsibility for Their Equipment:
The Client shall be responsible for ensuring the safety of their personal equipment used in the activity, and its suitability for the intended purpose.
Second: Non-Liability of the Company:
The Company shall not bear any liability for any defects or malfunctions in the Client's personal equipment, or for any damages resulting from its use.
Third: Service Provider's Equipment:
In the event equipment is provided by the service provider, the responsibility for the safety of such equipment shall lie solely with the service provider.
Article (34): Photography and Recording
First: Consent to Photography:
The Client agrees that the Company or its representatives may photograph or record video of them during participation in activities.
Second: Use of Images:
The Client agrees that the Company may use such images and video clips for promotional and marketing purposes on its electronic platforms and social media, without any financial consideration.
Third: Withdrawal of Consent:
The Client may withdraw their consent to the use of their images at any time by notifying the Company in writing.
Article (35): Emergency Procedures
First: Consent to Medical Procedures:
The Client agrees that the Company or its representatives may take necessary medical procedures in case of emergency, including:
· Administering first aid.
· Transporting the Client to the nearest medical facility.
· Contacting the competent medical authorities.
Second: Bearing of Costs:
The Client or their guardian shall bear all medical costs and transportation and accommodation expenses arising from emergency situations.
Article (36): Age and Health Restrictions
First: Age Restrictions:
Some activities are subject to age restrictions, and the Client shall be responsible for ensuring they meet the required age conditions prior to booking.
Second: Health Restrictions:
The Company and service providers reserve the right to prevent the Client from participating in any activity if it appears to them that this poses a risk to their safety or the safety of others, based on their professional assessment.
───
PART FOUR: CLIENT'S FINAL ACKNOWLEDGMENT
The Client acknowledges the following:
☑ I acknowledge that I have read and understood all the Terms and Conditions set forth in this Agreement, including the Privacy Policy and Risk Acknowledgment.
☑ I agree that clicking the "I Agree," "Complete Booking," or "Confirm Payment" button constitutes a legally binding electronic signature, having the same legal validity as a written signature in accordance with the Egyptian Electronic Signature Law No. 15 of 2004.
☑ I acknowledge that ORLUXUS MARKETING AND BRANDING operates as a marketing platform, broker, and booking organizer, and is not a licensed tourism company, and is not responsible for the execution of services provided by third parties.
☑ I agree to the limitations of liability and disclaimers set forth in this Agreement.
☑ I agree to the Cancellation and Refund Policy and the Data Protection Policy.
☑ I acknowledge that I bear full responsibility for my physical safety, for my full understanding of the risks associated with the activities, and for any consequences arising from my concealment of any health information or my violation of safety instructions, and I hereby waive any right I may have to sue the Company or service providers for any injuries or damages arising from participation in these activities, unless resulting from gross negligence or willful misconduct on the part of the Company.
☑ I agree to the collection and processing of my personal data in accordance with the attached Privacy Policy.
☑ I acknowledge that I am at least 18 years of age (or that my legal guardian has agreed to this Agreement on my behalf).
───
FINAL PROVISIONS
By clicking the "Complete Booking" or "Confirm Payment" button, you acknowledge and agree to the following:
1. That you have read, understood, and accepted all the Terms and Conditions, Privacy Policy, and Risk Acknowledgment of ORLUXUS MARKETING AND BRANDING, and agree to comply with all their provisions.
2. That this consent constitutes a legally binding electronic signature in accordance with the provisions of the Egyptian Electronic Signature Law No. 15 of 2004, and has the same legal validity as a written signature.
3. That you acknowledge and agree that the Company operates as a marketing platform, broker, and booking organizer, and is not a licensed tourism company, and that its liability is limited in accordance with what is set forth in this Agreement.
4. That you agree to the Cancellation and Refund Policy, and to the collection and processing of your personal data in accordance with the Privacy Policy.
5. That you bear full responsibility for your personal safety during participation in activities, and acknowledge the risks associated therewith.
6. That you agree that this consent supersedes any other written or oral procedures, and shall be deemed evidence of the conclusion of the contract between you and the Company.
───
CONCLUSION
This Agreement constitutes the complete and integrated contract between the Client and the Company, and includes all the essential provisions relating to marketing and brokerage services, data protection, and risk acknowledgment.
This Agreement is prepared in the Arabic language, which shall be the authoritative language in the event of any conflict with any other translation.
───
ORLUXUS MARKETING AND BRANDING
Company's Electronic Signature: [ORLUXUS MARKETING AND BRANDING]
Date: ${formattedDate}
Transaction ID: ${txId}
`;

  return contract;
}
