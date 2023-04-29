import axios, { AxiosRequestConfig } from 'axios'
import { createObjectCsvWriter } from 'csv-writer'
import { CsvWriter } from 'csv-writer/src/lib/csv-writer'
import { CrUXApiResponse, CrUXApiRequestParam, CrUXDataItemFrame } from './main.types'
import { generateCsvRecord } from './main.function'
import config from './config'

const API_KEY = config.apiKey
const API_URL = 'https://chromeuxreport.googleapis.com/v1/records:queryHistoryRecord'
const CSV_FILE_NAME = './dist/crux-data.csv'
const FORM_FACTOR = ['PHONE', 'DESKTOP', 'ALL']
const RATE_LIMIT = 100

// Set the URLs you want to fetch CrUX data for
const URLs: string[] = [
  'https://www.eventbrite.com',
  'https://www.eventbrite.com/signin/',
  'https://www.eventbrite.com/signin/signup',
  'https://www.eventbrite.com/contact/',
  'https://www.eventbrite.com/about/',
  'https://www.eventbrite.com/contact-sales/',
  'https://www.eventbrite.com/team/',
  'https://www.eventbrite.com/apps/',
  'https://www.eventbrite.com/blog/',
  'https://www.eventbrite.com/d/online/all-events/',
  'https://www.eventbrite.com/d/united-states/all-events/',
  'https://www.eventbrite.com/d/ny--new-york/events--today/',
  'https://www.eventbrite.com/d/ny--new-york/all-events/',
  'https://www.eventbrite.com/d/ca--los-angeles/events--today/',
  'https://www.eventbrite.com/d/ny--new-york/events/',
  'https://www.eventbrite.com/d/online/events/',
  'https://www.eventbrite.com/d/il--chicago/events--today/',
  'https://www.eventbrite.com/d/ca--los-angeles/all-events/',
  'https://www.eventbrite.com/d/ca--los-angeles/events--this-weekend/',
  'https://www.eventbrite.com/d/il--chicago/all-events/',
  'https://www.eventbrite.com/d/il--chicago/events/',
  'https://www.eventbrite.com/d/ny--new-york/events--this-weekend/',
  'https://www.eventbrite.com/d/co--denver/events--today/',
  'https://www.eventbrite.com/d/dc--washington/all-events/',
  'https://www.eventbrite.com/d/dc--washington/events--today/',
  'https://www.eventbrite.com/d/tx--houston/events--today/',
  'https://www.eventbrite.com/d/ca--los-angeles/events/',
  'https://www.eventbrite.com/d/ca--san-diego/events--today/',
  'https://www.eventbrite.com/d/dc--washington/events--this-weekend/',
  'https://www.eventbrite.com/d/united-states/events/',
  'https://www.eventbrite.com/d/ca--san-francisco/events--today/',
  'https://www.eventbrite.com/d/co--denver/events--this-weekend/',
  'https://www.eventbrite.com/d/ga--atlanta/events--today/',
  'https://www.eventbrite.com/d/tx--houston/all-events/',
  'https://www.eventbrite.com/d/tx--dallas/events--today/',
  'https://www.eventbrite.com/d/il--chicago/events--this-weekend/',
  'https://www.eventbrite.com/d/ca--san-francisco/all-events/',
  'https://www.eventbrite.com/d/ga--atlanta/all-events/',
  'https://www.eventbrite.com/d/dc--washington/events/',
  'https://www.eventbrite.com/d/tx--dallas/events--this-weekend/',
  'https://www.eventbrite.com/d/online/free--events/',
  'https://www.eventbrite.com/d/ca--san-francisco/events/',
  'https://www.eventbrite.com/d/ma--boston/events--today/',
  'https://www.eventbrite.com/d/ga--atlanta/events--this-weekend/',
  'https://www.eventbrite.com/d/ny--new-york/free--events/',
  'https://www.eventbrite.com/d/ga--atlanta/events/',
  'https://www.eventbrite.com/d/oh--cincinnati/events--this-weekend/',
  'https://www.eventbrite.com/d/ca--san-diego/events--this-weekend/',
  'https://www.eventbrite.com/d/tx--houston/events--this-weekend/',
  'https://www.eventbrite.com/d/ca--san-francisco/events--this-weekend/',
  'https://www.eventbrite.com/d/wa--seattle/events--this-weekend/',
  'https://www.eventbrite.com/d/tx--dallas/all-events/',
  'https://www.eventbrite.com/d/united-states/events--this-weekend/',
  'https://www.eventbrite.com/d/az--phoenix/events--today/',
  'https://www.eventbrite.com/d/nc--charlotte/events--this-weekend/',
  'https://www.eventbrite.com/d/nc--charlotte/events--today/',
  'https://www.eventbrite.com/d/nc--charlotte/all-events/',
  'https://www.eventbrite.com/d/united-states--new-jersey/events--this-weekend/',
  'https://www.eventbrite.com/d/mn--minneapolis/events--this-weekend/',
  'https://www.eventbrite.com/e/bacchanal-2023-tickets-558068847947',
  'https://www.eventbrite.com/e/free-fire-master-league-season-7-grand-finals-tickets-559258305647',
  'https://www.eventbrite.com/e/foodieland-night-market-las-vegas-march-31-april-2-2023-tickets-480052629337',
  'https://www.eventbrite.com/e/texas-street-food-festival-tickets-543318419017',
  'https://www.eventbrite.com/e/free-fire-master-league-season-7-tickets-559258305647',
  'https://www.eventbrite.com/e/foodieland-night-market-las-vegas-march-24-26-2023-tickets-475818725617',
  'https://www.eventbrite.com/e/taarangana-2023-day-1-tickets-616903574197',
  'https://www.eventbrite.com/e/13453488979',
  'https://www.eventbrite.com/e/orlando-taco-festival-tickets-567299597367',
  'https://www.eventbrite.com/e/igdtuw-taarangana-2023-day-2-tickets-617611391297',
  'https://www.eventbrite.com/e/freaknic-atlanta-juneteeth-weekend-2023-tickets-463773237237',
  'https://www.eventbrite.com/e/orange-crush-2k23-tickets-511405145557',
  'https://www.eventbrite.com/e/rally-for-trump-with-marjorie-taylor-greene-jack-posobiec-graham-allen-tickets-605319706537',
  'https://www.eventbrite.com/e/miami-dade-countryfest-tickets-590384504947',
  'https://www.eventbrite.com/e/why-the-6-month-ai-pause-is-a-bad-idea-tickets-608822272807',
  'https://www.eventbrite.com/e/10-million-subscriber-party-pinkshirtcouple-tickets-606765531037',
  'https://www.eventbrite.com/e/explore-jpl-2023-tickets-588466016697',
  'https://www.eventbrite.com/e/curlfest-2023-tickets-617187011967',
  'https://www.eventbrite.com/e/the-sesh-atl-tickets-564081000457',
  'https://www.eventbrite.com/e/the-chosen-insiders-conference-tickets-579211135097',
  'https://www.eventbrite.com/e/covid-19-vaccination-drive-thru-priority-groups-65-tickets-134437782025',
  'https://www.eventbrite.com/e/foodieland-night-market-san-diego-may-5-7-2023-tickets-444705615467',
  'https://www.eventbrite.com/e/women-for-nikki-town-hall-des-moines-ia-tickets-602569450447',
  'https://www.eventbrite.com/e/dallas-food-fest-tickets-520948299387',
  'https://www.eventbrite.com/e/springtime-easter-festival-tickets-521812313677',
  'https://www.eventbrite.com/e/may-5th-fiesta-friday-tickets-558296619217',
  'https://www.eventbrite.com/e/mile-high-420-festival-tickets-508615180697',
  'https://www.eventbrite.com/e/2023-fuelfest-dallas-fort-worth-tickets-470798560167',
  'https://www.eventbrite.com/e/miranda-lambert-signs-yall-eat-yet-at-the-pink-pistol-in-lindale-tx-tickets-579373661217',
  'https://www.eventbrite.com/e/pocono420-tickets-311920842637',
  'https://www.eventbrite.com/e/grentperez-tickets-394452166047',
  'https://www.eventbrite.com/e/atlantas-rnb-and-soul-picnic-mothers-day-edition-sat-sun-may-13-14-tickets-497156417227',
  'https://www.eventbrite.com/e/queen-charlotte-fair-tickets-572307807057',
  'https://www.eventbrite.com/e/los-angeles-times-festival-of-books-2023-tickets-572023065387',
  'https://www.eventbrite.com/e/margarita-sangria-fest-at-lincoln-park-zoo-tickets-595135555467',
  'https://www.eventbrite.com/e/endless-lobster-at-new-york-times-square-red-lobster-tickets-576383337077',
  'https://www.eventbrite.com/e/united-states-sail-grand-prix-san-francisco-tickets-465681785757',
  'https://www.eventbrite.com/e/opm-presents-thriving-in-a-hybrid-environment-virtual-tickets-577708952027',
  'https://www.eventbrite.com/e/poetry-the-creative-mind-a-national-poetry-month-gala-fundraiser-registration-570079472047',
  'https://www.eventbrite.com/e/rally-with-nikki-haley-lexington-sc-tickets-602757342437',
  'https://www.eventbrite.com/e/420-gumbo-pop-up-live-concert-by-moneybagg-yo-friends-tickets-571961671757',
  'https://www.eventbrite.com/e/cmt-music-awards-outdoor-stage-carrie-underwood-keith-urban-and-more-tickets-569935621787',
  'https://www.eventbrite.com/e/orange-crush-2k23-official-ticket-link-tickets-594974754507',
  'https://www.eventbrite.com/e/aries-szn-tickets-593854313237',
  'https://www.eventbrite.com/e/2023-grand-design-rv-national-owners-rally-registration-598610739837',
  'https://www.eventbrite.com/e/2023-daily-tickets-dumbarton-oaks-gardens-tickets-523910348957',
  'https://www.eventbrite.com/e/restaurante-tematico-magia-bruxaria-tickets-122604004879',
  'https://www.eventbrite.com/e/ganbatte-mini-con-tickets-521890256807',
  'https://www.eventbrite.com/e/rose-bowl-flea-market-sunday-april-9th-tickets-377540783647',
  'https://www.eventbrite.com/e/high-tolerance-friends-420-cannaval-festival-tickets-585851225787',
  'https://www.eventbrite.com/l/sell-tickets-lp/',
  'https://www.eventbrite.com/l/sell-tickets/',
  'https://www.eventbrite.com/l/get-discovered-eb/',
  'https://www.eventbrite.com/l/registration-online/',
  'https://www.eventbrite.com/l/community-guidelines/',
  'https://www.eventbrite.com/l/eventbrite-app/',
  'https://www.eventbrite.com/l/find-your-people/',
  'https://www.eventbrite.com/l/online-rsvp/',
  'https://www.eventbrite.com/l/music-venues/',
  'https://www.eventbrite.com/l/professional-services/',
  'https://www.eventbrite.com/l/virtual-events-platform/',
  'https://www.eventbrite.com/l/create-a-workshop/',
  'https://www.eventbrite.com/l/plan-a-party/',
  'https://www.eventbrite.com/l/organizer-check-in-app/',
  'https://www.eventbrite.com/l/how-to-use-qr-codes-for-events/',
  'https://www.eventbrite.com/l/festival-solutions/',
  'https://www.eventbrite.com/l/event-payment/',
  'https://www.eventbrite.com/l/event-management-software/',
  'https://www.eventbrite.com/l/performing-arts/',
  'https://www.eventbrite.com/l/planning-an-event/',
  'https://www.eventbrite.com/l/contact-eventbrite-sales/',
  'https://www.eventbrite.com/l/post-events/',
  'https://www.eventbrite.com/l/sell-tickets-lp-3/',
  'https://www.eventbrite.com/l/frequently-asked-questions/',
  'https://www.eventbrite.com/l/npo/',
  'https://www.eventbrite.com/l/legalterms/',
  'https://www.eventbrite.com/l/conferences/',
  'https://www.eventbrite.com/l/sell-tickets-now-on-eventbrite-2/',
  'https://www.eventbrite.com/l/sell-tickets-now-on-eventbrite-1/',
  'https://www.eventbrite.com/l/music/',
  'https://www.eventbrite.com/l/eventbrite-for-business/',
  'https://www.eventbrite.com/l/contentstandards/',
  'https://www.eventbrite.com/l/accessibility/',
  'https://www.eventbrite.com/l/get-discovered-with-eventbrite/',
  'https://www.eventbrite.com/l/complete-guide-to-setting-up-your-event/',
  'https://www.eventbrite.com/l/community-engagement/',
  'https://www.eventbrite.com/l/online-invitations/',
  'https://www.eventbrite.com/l/taxes/',
  'https://www.eventbrite.com/l/food-drink-event-ticketing/',
  'https://www.eventbrite.com/l/make-your-own-tickets/',
  'https://www.eventbrite.com/l/creator-collective/',
  'https://www.eventbrite.com/l/safety-playbook/',
  'https://www.eventbrite.com/l/coronavirus-resources-event-attendees/',
  'https://www.eventbrite.com/l/email-marketing/',
  'https://www.eventbrite.com/l/sell-tickets-lp-2/',
  'https://www.eventbrite.com/l/get-discovered-with-eb/',
  'https://www.eventbrite.com/l/reunions/',
  'https://www.eventbrite.com/l/event-marketing-tools/',
  'https://www.eventbrite.com/l/event-listing/',
  'https://www.eventbrite.com/l/host-yoga-event/',
  'https://www.eventbrite.com/o/lava-cantina-the-colony-18690227135',
  'https://www.eventbrite.com/o/poshmark-4349397141',
  'https://www.eventbrite.com/o/atlanta-streetwear-market-13084332653',
  'https://www.eventbrite.com/o/moonlight-rollerway-inc-33124756465',
  'https://www.eventbrite.com/o/harvard-university-visitor-center-30492393010',
  'https://www.eventbrite.com/o/southeast-crab-feast-9804010013',
  'https://www.eventbrite.com/o/circo-hermanos-caballero-18541305933',
  'https://www.eventbrite.com/o/kids-party-cruise-10618410186',
  'https://www.eventbrite.com/o/crooners-supper-club-17975642816',
  'https://www.eventbrite.com/o/srf-lake-shrine-31774286891',
  'https://www.eventbrite.com/o/lincoln-park-conservancy-17342067619',
  'https://www.eventbrite.com/o/lunar-faire-33287495721',
  'https://www.eventbrite.com/o/stereo-live-houston-3006970476',
  'https://www.eventbrite.com/o/her-ramfest-week-2023-62083321313',
  'https://www.eventbrite.com/o/barnhill-vineyards-16682771628',
  'https://www.eventbrite.com/o/the-revel-patio-grill-9570637763',
  'https://www.eventbrite.com/o/8303624321',
  'https://www.eventbrite.com/o/stereo-live-dallas-18169391630',
  'https://www.eventbrite.com/o/rockville-science-center-18160864354',
  'https://www.eventbrite.com/o/aura-17850932915',
  'https://www.eventbrite.com/o/in-a-landscape-10898118534',
  'https://www.eventbrite.com/o/the-riot-comedy-club-29979960920',
  'https://www.eventbrite.com/o/brauer-house-amp-bhouse-live-18059974031',
  'https://www.eventbrite.com/o/usa-teens-15854796088',
  'https://www.eventbrite.com/o/national-library-board-26735252849',
  'https://www.eventbrite.com/o/sister-18737258063',
  'https://www.eventbrite.com/o/the-comedy-bar-chicago-17584944942',
  'https://www.eventbrite.com/o/the-cutting-room-18017269175',
  'https://www.eventbrite.com/o/disc-golf-pro-tour-32912418431',
  'https://www.eventbrite.com/o/professional-bowlers-association-2176297183',
  'https://www.eventbrite.com/o/encoreatx-13476342648',
  'https://www.eventbrite.com/o/tim-boss-31774842755',
  'https://www.eventbrite.com/o/missouri-star-retreats-5151510907',
  'https://www.eventbrite.com/o/show-me-snakes-23204638345',
  'https://www.eventbrite.com/o/melrose-ballroom-19226907785',
  'https://www.eventbrite.com/o/wasted-presents-8641709466',
  'https://www.eventbrite.com/o/comic-strip-live-comedy-club-8100188167',
  'https://www.eventbrite.com/o/club-comedy-seattle-18936516174',
  'https://www.eventbrite.com/o/eventswithfurious-14225797363',
  'https://www.eventbrite.com/o/thc-hospitality-59849029993',
  'https://www.eventbrite.com/o/booze-n-brush-sip-n-paint-events-18438588912',
  'https://www.eventbrite.com/o/gardena-cinema-31976506589',
  'https://www.eventbrite.com/o/unicorn-world-54604040283',
  'https://www.eventbrite.com/o/tampa-bay-downs-11832203678',
  'https://www.eventbrite.com/o/central-market-cooking-school-austin-north-lamar-30370421142',
  'https://www.eventbrite.com/o/itll-do-club-27824480441',
  'https://www.eventbrite.com/o/food-bank-of-delaware-6926290001',
  'https://www.eventbrite.com/o/sarasota-polo-club-18437800431',
  'https://www.eventbrite.com/o/snkr-bst-36119155553',
  'https://www.eventbrite.com/o/bay-area-urban-areas-security-initiative-ba-uasi-33427021613',
  'https://www.eventbrite.com/c/music-festival-calendar-cwwhpcd/',
  'https://www.eventbrite.com/c/the-best-virtual-events-you-can-attend-from-home-cwwqhpk/',
  'https://www.eventbrite.com/c/virtual-wellness-fitness-events-cwwrcfp/',
  'https://www.eventbrite.com/c/eater-nyc-food-events-cgrkyrw/',
  'https://www.eventbrite.com/c/virtual-arts-crafts-classes-cwwrkgg/',
  'https://www.eventbrite.com/c/virtual-arts-culture-events-where-to-find-entertainment-tonight-cwxbtcw/',
  'https://www.eventbrite.com/c/womens-history-month-virtual-events-cwyrywd/',
  'https://www.eventbrite.com/c/virtual-earth-day-activities-ccbfwgyd/',
  'https://www.eventbrite.com/c/new-york-city-event-calendar-cfxwcyg/',
  'https://www.eventbrite.com/c/black-excellence-events-cwyhygw/',
  'https://www.eventbrite.com/c/in-the-kitchen-virtual-food-drink-events-classes-cwwrpkg/',
  'https://www.eventbrite.com/c/washington-dc-event-calendar-cfxtptk/',
  'https://www.eventbrite.com/c/things-to-do-los-angeles-event-calendar-cfxrryy/',
  'https://www.eventbrite.com/c/chicago-event-calendar-cfyzxpy/',
  'https://www.eventbrite.com/c/things-to-do-san-francisco-event-calendar-cfxrztd/',
  'https://www.eventbrite.com/c/things-to-do-london-event-calendar-cgrrypy/',
  'https://www.eventbrite.com/c/curated-online-events-you-can-experience-from-home-cwwqztp/',
  'https://www.eventbrite.com/c/virtual-wellness-fitness-events-cwwrcfp/%20',
  'https://www.eventbrite.com/c/educate-yourself-online-racial-equity-workshops-cwwzzcp/',
  'https://www.eventbrite.com/c/black-history-events-every-month-inspire-action-education-connection-cwxqphr/',
  'https://www.eventbrite.com/c/los-angeles-valentines-day-events-ccmxcwpm/',
  'https://www.eventbrite.com/c/new-york-valentines-day-events-ccmxcwhz/',
  'https://www.eventbrite.com/c/children-cwxxfqk--29mUUMPCDfoQ/',
  'https://www.eventbrite.com/c/best-online-events-uk-ireland-cwxygxg/',
  'https://www.eventbrite.com/c/singapore-cwxxfqb--9kxSur7UT2bx/',
  'https://www.eventbrite.com/c/st-patricks-day-events-new-york-ccmxcwqc/',
  'https://www.eventbrite.com/c/chicago-valentines-day-events-ccmxcwkq/',
  'https://www.eventbrite.com/c/time-of-your-life-cwxcxpk--e6NrslCIdJ6z/',
  'https://www.eventbrite.com/c/st-patricks-day-events-los-angeles-ccmxcwrh/',
  'https://www.eventbrite.com/c/st-patricks-day-events-london-ccmxcwtq/',
  'https://www.eventbrite.com/c/st-patricks-day-events-san-francisco-ccmxcwqt/',
  'https://www.eventbrite.com/c/london-coronation-events-ccmxcwwf/',
  'https://www.eventbrite.com/c/arts-culture-cwxxfpy--tzBeqp0yLd9k/',
  'https://www.eventbrite.com/c/virtual-holiday-events-christmas-hanukkah-kwanzaa-cwycdzg/',
  'https://www.eventbrite.com/c/st-patricks-day-events-chicago-ccmxcwrz/',
  'https://www.eventbrite.com/c/london-valentines-day-events-ccmxcwmf/',
  'https://www.eventbrite.com/c/stop-asian-hate-virtual-events-ccbddmmg/',
  'https://www.eventbrite.com/c/social-connection-project-cchkwffq/',
  'https://www.eventbrite.com/c/nlb-accessible-programmes-ccbkkzrg--mEsYVHoXnShB/',
  'https://www.eventbrite.com/c/dc-public-schools-parent-university-universidad-para-padres-cwwxfgp--HICuoIZ2J8au/',
  'https://www.eventbrite.com/c/melbourne-event-calendar-cchkwfkc/',
  'https://www.eventbrite.com/c/early-literacy-cwxxfqg--lcYArARcGBYd/',
  'https://www.eventbrite.com/c/online-kid-activities-events-cwwrdbd/',
  'https://www.eventbrite.com/c/future-of-work-cwxpqdg--Vsun0lhULTGa/',
  'https://www.eventbrite.com/c/career-cwxxfpk--xD4DyfSon0AZ/',
  'https://www.eventbrite.com/c/san-francisco-holiday-events-ccmxctxx/',
  'https://www.eventbrite.com/c/upcoming-mixed-gender-naked-yoga-classes-ccbgpbzb--3V5inrmzVMhh/',
  'https://www.eventbrite.com/c/your-vote-counts-virtual-voter-education-events-and-workshops-cwxqcqk/',
  'https://www.eventbrite.com/c/the-talk-ccmxctrc/',
  'https://www.eventbrite.com/c/reading-cwxxfpw--hG6FDPMCfuVL/',
  'https://www.eventbrite.com/cc/opm-presents-thriving-in-a-hybrid-environment-1849319',
  'https://www.eventbrite.com/cc/las-vegas-1446939',
  'https://www.eventbrite.com/cc/unicorn-world-houston-may-12-14-1797029',
  'https://www.eventbrite.com/cc/ramadan-suhoor-festival-2023-1776449',
  'https://www.eventbrite.com/cc/unicorn-world-greenville-1791579',
  'https://www.eventbrite.com/cc/unicorn-world-indianapolis-may-20-21-1867049',
  'https://www.eventbrite.com/cc/richmond-virginia-temple-public-open-house-1538669',
  'https://www.eventbrite.com/cc/unicorn-world-miami-june-2-4-1956299',
  'https://www.eventbrite.com/cc/unicorn-world-atlanta-june-16-18-1963229',
  'https://www.eventbrite.com/cc/oregon-renaissance-faire-2023-1387429',
  'https://www.eventbrite.com/cc/national-day-of-hiring-2023-66269',
  'https://www.eventbrite.com/cc/black-beach-weekend-2023-events-1529839',
  'https://www.eventbrite.com/cc/2023-cmt-music-awards-week-events-1938429',
  'https://www.eventbrite.com/cc/london-film-comic-con-2023-1108369',
  'https://www.eventbrite.com/cc/dirty-dancing-open-air-cinema-uk-tour-2023-1706379',
  'https://www.eventbrite.com/cc/washington-midsummer-renaissance-faire-2023-1309699',
  'https://www.eventbrite.com/cc/adventure-cinema-elvis-open-air-cinema-tour-2023-1252859',
  'https://www.eventbrite.com/cc/shows-secrets-1314099',
  'https://www.eventbrite.com/cc/warhammer-fest-2023-1375029',
  'https://www.eventbrite.com/cc/experience-bar-1290109',
  'https://www.eventbrite.com/cc/oak-mountain-state-fair-march-24th-april-9th-1862649',
  'https://www.eventbrite.com/cc/sonder-socials-68249',
  'https://www.eventbrite.com/cc/homeowner-application-preparation-sessions-331539',
  'https://www.eventbrite.com/cc/end-of-the-rope-premieres-1594239',
  'https://www.eventbrite.com/cc/world-book-day-2023-1784609',
  'https://www.eventbrite.com/cc/san-diego-1446999',
  'https://www.eventbrite.com/cc/historic-garden-week-april-15-22-2023-tickets-1502709',
  'https://www.eventbrite.com/cc/lego-easter-make-n-take-workshops-1963779',
  'https://www.eventbrite.com/cc/2023-wdf-lakeside-world-championships-1809359',
  'https://www.eventbrite.com/cc/design-variations-2023-1913969',
  'https://www.eventbrite.com/cc/the-courtyard-at-fourth-co-1489019',
  'https://www.eventbrite.com/cc/75th-annual-zembo-shrine-circus-1683739',
  'https://www.eventbrite.com/cc/destination-acadie-2023-1966819',
  'https://www.eventbrite.com/cc/gcc-spring-2023-1463479',
  'https://www.eventbrite.com/cc/hidden-in-plain-sight-1748129',
  'https://www.eventbrite.com/cc/unicorn-world-columbus-july-8-9-2020729',
  'https://www.eventbrite.com/cc/marmalade-festival-2023-1834339',
  'https://www.eventbrite.com/cc/german-salvatore-brothers-con-vol-2-2042289',
  'https://www.eventbrite.com/cc/official-tickets-1258789',
  'https://www.eventbrite.com/cc/the-sculpt-society-2023-tour-1052409',
  'https://www.eventbrite.com/cc/bamboozle-festival-2061179',
  'https://www.eventbrite.com/cc/makeit-at-libraries-programmes-104559',
  'https://www.eventbrite.com/cc/cricut-tour-in-partnership-with-hobbycraft-2018319',
  'https://www.eventbrite.com/cc/adventure-cinema-is-coming-to-nottingham-1992389',
  'https://www.eventbrite.com/cc/kim-haberley-takes-the-usa-1973609',
  'https://www.eventbrite.com/cc/ebony-fit-weekend-houston-2023-1623799',
  'https://www.eventbrite.com/cc/adventure-cinema-is-coming-to-calke-abbey-1810609',
  'https://www.eventbrite.com/cc/dallas-housetechno-shows-87589',
  'https://www.eventbrite.com/cc/adventure-cinema-is-coming-to-shugborough-1807229',
  'https://www.eventbrite.com/cc/ihss-career-pathways-1464219',
  'https://www.eventbrite.com/b/ny--new-york/music/',
  'https://www.eventbrite.com/b/ca--los-angeles/music/',
  'https://www.eventbrite.com/b/il--chicago/music/',
  'https://www.eventbrite.com/b/ny--new-york/food-and-drink/',
  'https://www.eventbrite.com/b/ny--new-york/arts/',
  'https://www.eventbrite.com/b/ga--atlanta/music/',
  'https://www.eventbrite.com/b/ca--san-francisco/music/',
  'https://www.eventbrite.com/b/online/music/',
  'https://www.eventbrite.com/b/dc--washington/music/',
  'https://www.eventbrite.com/b/united-states--kansas/music/',
  'https://www.eventbrite.com/b/tx--houston/music/',
  'https://www.eventbrite.com/b/tx--dallas/music/',
  'https://www.eventbrite.com/b/nc--charlotte/music/',
  'https://www.eventbrite.com/b/il--chicago/food-and-drink/',
  'https://www.eventbrite.com/b/fl--miami/music/',
  'https://www.eventbrite.com/b/ny--new-york/business/',
  'https://www.eventbrite.com/b/united-states--florida/music/',
  'https://www.eventbrite.com/b/nv--las-vegas/music/',
  'https://www.eventbrite.com/b/dc--washington/food-and-drink/',
  'https://www.eventbrite.com/b/ca--los-angeles/food-and-drink/',
  'https://www.eventbrite.com/b/ma--boston/music/',
  'https://www.eventbrite.com/b/pa--philadelphia/music/',
  'https://www.eventbrite.com/b/ca--los-angeles/arts/',
  'https://www.eventbrite.com/b/united-states--georgia/music/',
  'https://www.eventbrite.com/b/ga--atlanta/food-and-drink/',
  'https://www.eventbrite.com/b/mexico--tulum/music/',
  'https://www.eventbrite.com/b/tx--houston/food-and-drink/',
  'https://www.eventbrite.com/b/ny--new-york/hobbies/',
  'https://www.eventbrite.com/b/united-kingdom--london/music/',
  'https://www.eventbrite.com/b/fl--orlando/music/',
  'https://www.eventbrite.com/b/tx--dallas/food-and-drink/',
  'https://www.eventbrite.com/b/tx--austin/music/',
  'https://www.eventbrite.com/b/il--chicago/arts/',
  'https://www.eventbrite.com/b/la--new-orleans/food-and-drink/',
  'https://www.eventbrite.com/b/online/business/',
  'https://www.eventbrite.com/b/md--baltimore/music/',
  'https://www.eventbrite.com/b/dc--washington/arts/',
  'https://www.eventbrite.com/b/ca--san-diego/music/',
  'https://www.eventbrite.com/b/la--new-orleans/music/',
  'https://www.eventbrite.com/b/az--phoenix/music/',
  'https://www.eventbrite.com/b/tn--nashville/music/',
  'https://www.eventbrite.com/b/ca--san-francisco/holiday/',
  'https://www.eventbrite.com/b/ga--atlanta/arts/',
  'https://www.eventbrite.com/b/co--denver/music/',
  'https://www.eventbrite.com/b/ca--oakland/music/',
  'https://www.eventbrite.com/b/united-states--texas/music/',
  'https://www.eventbrite.com/b/nc--raleigh/music/',
  'https://www.eventbrite.com/b/pa--philadelphia/food-and-drink/',
  'https://www.eventbrite.com/b/fl--tampa/music/',
  'https://www.eventbrite.com/b/ca--san-francisco/food-and-drink/',
  'https://www.eventbrite.com/organizer/overview/',
  'https://www.eventbrite.com/organizer/pricing/',
  'https://www.eventbrite.com/organizer/compare-packages/',
  'https://www.eventbrite.com/blog/business-event-invitation-ds00/',
  'https://www.eventbrite.com/blog/10-event-ideas-college-students-ds00/',
  'https://www.eventbrite.com/blog/10-international-womens-day-event-ideas/',
  'https://www.eventbrite.com/blog/sponsorship-email-ds00/',
  'https://www.eventbrite.com/blog/event-email-examples-ds00/',
  'https://www.eventbrite.com/blog/inspiring-event-themes-ds00/',
  'https://www.eventbrite.com/blog/types-event-tickets-ds00-pch/',
  'https://www.eventbrite.com/blog/creative-event-promotion-ideas-ds00/',
  'https://www.eventbrite.com/blog/event-ideas-college-students-ds00/',
  'https://www.eventbrite.com/blog/fundraising-ideas-ds00/',
  'https://www.eventbrite.com/blog/seminar-planning-checklist-ds00/',
  'https://www.eventbrite.com/blog/event-invite-subject-lines-ds00/',
  'https://www.eventbrite.com/blog/70-event-ideas-and-formats-to-inspire-your-next-great-event-ds00/',
  'https://www.eventbrite.com/blog/speaker-bio-ds00/',
  'https://www.eventbrite.com/blog/event-planning-playlist-ds00/',
  'https://www.eventbrite.com/blog/event-catering-ideas-menu-ds00/',
  'https://www.eventbrite.com/blog/gracefully-cancel-event-ds00/',
  'https://www.eventbrite.com/blog/qr-codes-for-events-ds00/',
  'https://www.eventbrite.com/blog/ticketfly-moving-eventbrite/',
  'https://www.eventbrite.com/blog/award-ceremony-ideas-ds00/',
  'https://www.eventbrite.com/blog/eventbrite-website-integration-ds00/',
  'https://www.eventbrite.com/blog/spiritual-retreat-activities-ds00/',
  'https://www.eventbrite.com/blog/how-to-plan-a-successful-charity-event-ds00/',
  'https://www.eventbrite.com/blog/everything-need-know-first-rocky-horror-picture-show/',
  'https://www.eventbrite.com/blog/ticket-resale-partners-ds00/',
  'https://www.eventbrite.com/blog/sponsorship-packages-ds00/',
  'https://www.eventbrite.com/blog/social-media-ad-copy-events-ds00-pch/',
  'https://www.eventbrite.com/blog/facebook-event-inspo-ds00/',
  'https://www.eventbrite.com/blog/how-to-advertise-an-event-ds00/',
  'https://www.eventbrite.com/blog/mothers-day-event-ideas/',
  'https://www.eventbrite.com/blog/sponsorship-ideas-ds00/',
  'https://www.eventbrite.com/blog/ds00-how-to-write-a-post-event-blog/',
  'https://www.eventbrite.com/blog/email-templates-for-postponing-your-event-ds00/',
  'https://www.eventbrite.com/blog/types-event-tickets-ds00/',
  'https://www.eventbrite.com/blog/event-marketing-plan-ds00/',
  'https://www.eventbrite.com/blog/tips-for-more-successful-food-drink-event-partnerships-ds00/',
  'https://www.eventbrite.com/blog/ds00-5ways-to-make-extra-money-from-your-event/',
  'https://www.eventbrite.com/blog/event-management-courses-certifications/',
  'https://www.eventbrite.com/blog/invitation-email-templates-ds00/',
  'https://www.eventbrite.com/blog/new-years-eve-event-ds00/',
  'https://www.eventbrite.com/blog/networking-activities-corporate-icebreakers-ds00/',
  'https://www.eventbrite.com/blog/create-a-custom-banner-for-your-event-ds00/',
  'https://www.eventbrite.com/blog/thank-you-gifts-for-speakers-ds00/',
  'https://www.eventbrite.com/blog/event-life-lessons-ds00/',
  'https://www.eventbrite.com/blog/spot-ticket-fraud-social-media-ds00/',
  'https://www.eventbrite.com/blog/event-swot-analysis/',
  'https://www.eventbrite.com/blog/event-planning-quotes-ds00/',
  'https://www.eventbrite.com/blog/best-event-apps-ds00/',
  'https://www.eventbrite.com/blog/valentines-event-ideas-ds00/',
]

// Set the CrUX metrics you want to retrieve
const CRUX_METRICS: string[] = [
  'largest_contentful_paint',
  'first_input_delay',
  'cumulative_layout_shift',
  'first_contentful_paint',
  'experimental_interaction_to_next_paint',
  'experimental_time_to_first_byte',
]

// Set the headers for the CSV file
const csvHeaders = [
  { id: 'first_date', title: 'first_date' },
  { id: 'last_date', title: 'last_date' },
  { id: 'p75', title: 'p75' },
  { id: 'good', title: 'good' },
  { id: 'needs_improvement', title: 'needs_improvement' },
  { id: 'poor', title: 'poor' },
  { id: 'url', title: 'url' },
  { id: 'metric_short_name', title: 'metric_short_name' },
  { id: 'form_factor', title: 'form_factor' },
  { id: 'high_threshold', title: 'high_threshold' },
  { id: 'low_threshold', title: 'low_threshold' },
]

// Create a CSV writer to write the data to a file
const csvWriterInstance = createObjectCsvWriter({
  path: CSV_FILE_NAME,
  header: csvHeaders,
})

// Function to fetch CrUX data and write to CSV
export async function fetchCrUXData(
  requestParam: CrUXApiRequestParam,
  csvWriterInstance: CsvWriter<CrUXDataItemFrame>,
): Promise<void> {
  // Loop through each URL and fetch CrUX data
  for (let i = 0; i < requestParam.urls.length; i++) {
    for (const form_factor in FORM_FACTOR) {
      try {
        // Construct the API request
        const requestBody = {
          form_factor: form_factor,
          url: requestParam.urls[i],
          metrics: requestParam.metrics,
        }
        // Pulling data combined across desktop, tablet and phone
        if (form_factor == 'ALL') {
          requestBody.form_factor = ''
        }

        // Construct headers and plug in API key
        const requestConfig: AxiosRequestConfig = {
          headers: {
            'Content-Type': 'application/json',
            Accept: 'application/json',
          },
          params: {
            key: API_KEY,
          },
        }

        // Make the API request
        const response = await axios.post(API_URL, requestBody, requestConfig)
        const cruxApiResponse: CrUXApiResponse = response.data
        const csvRecords = generateCsvRecord(cruxApiResponse)
        // Write the data to the CSV file
        await csvWriterInstance.writeRecords(csvRecords)
        console.log(`Data fetched and written to CSV for URL: ${requestParam.urls[i]}`)
      } catch (error: unknown) {
        if (error instanceof Error) {
          console.log(`Error fetching data for URL: ${requestParam.urls[i]} - ${error.message}`)
        }
      }
      // Delay for the rate limit before fetching data for the next URL
      await new Promise(resolve => setTimeout(resolve, 60000 / requestParam.rate_limit)) // 60000 ms = 1 minute
    }
  }
}

// Start fetching CrUX data
const requestParam: CrUXApiRequestParam = {
  metrics: CRUX_METRICS,
  form_factor: FORM_FACTOR,
  urls: URLs,
  rate_limit: RATE_LIMIT, // 100 requests/min
}
fetchCrUXData(requestParam, csvWriterInstance)
