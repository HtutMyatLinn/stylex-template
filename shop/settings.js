(function () {
  if (!document.body || document.body.dataset.page !== "settings") return;

  var KEY = "stylex-shop-settings";
  var OTP = "123456";
  var POLICY_FALLBACK = "2026.11.12";
  var TAKEN = {
    google: ["taken@gmail.com"],
    facebook: ["used@facebook.com"],
    apple: ["taken@gmail.com"]
  };
  var pending = null;
  var state = load();

  var I18N = {
    en: {
      "page.title": "Settings",
      "nav.account": "Shop & Account",
      "nav.preferences": "Preferences",
      "nav.notifications": "Notifications",
      "nav.payout": "Payout & Payment",
      "nav.security": "Security",
      "nav.support": "Support & Legal",
      "nav.logout": "Log out",
      "summary.verified": "Verified seller",
      "summary.authPassword": "Email + password",
      "summary.authSocial": "Social login only",
      "account.kicker": "Shop profile",
      "account.title": "Configure shop branding, story, founders, policies, and vacation mode",
      "account.open": "Open shop profile",
      "account.contact": "Seller contact",
      "account.contactHelp": "Email and phone changes wait for a 6-digit code. Test code: 123456.",
      "account.email": "Seller email",
      "account.phone": "Myanmar phone",
      "account.saveEmail": "Update email",
      "account.savePhone": "Update phone",
      "pref.intro": "Language and theme update immediately and stay on this browser.",
      "pref.language": "Language",
      "pref.theme": "Theme",
      "pref.light": "Light",
      "pref.dark": "Dark",
      "pref.system": "System",
      "pref.systemHelp": "System follows this device’s light or dark setting.",
      "note.intro": "Each change saves immediately.",
      "note.order": "Order updates",
      "note.orderHelp": "New orders, cancellations, return requests, and payout releases.",
      "note.promo": "Promotions & campaigns",
      "note.promoHelp": "Flash sale invites and seller campaigns.",
      "note.system": "System & security",
      "note.systemHelp": "Policy updates, login alerts, and team role changes.",
      "note.email": "Email",
      "note.sms": "SMS",
      "note.push": "Push",
      "note.saved": "Notification preferences saved.",
      "pay.intro": "Account numbers stay masked. Only the last 4 digits are kept.",
      "pay.add": "Add a payout method",
      "pay.kind": "Type",
      "pay.label": "Name",
      "pay.number": "Account or card number",
      "pay.save": "Save method",
      "pay.wallet": "Mobile wallet",
      "pay.bank": "Bank account",
      "pay.card": "Corporate card",
      "pay.default": "Default",
      "pay.make": "Make default",
      "pay.remove": "Remove",
      "pay.empty": "No payout method yet. Add one to receive payouts.",
      "pay.added": "Payout method saved.",
      "pay.defaultSet": "Default payout method updated.",
      "pay.promoted": "The previous default was removed. The next method is now the default.",
      "pay.short": "Enter at least 4 digits. Only the last 4 are stored.",
      "pay.missing": "That payout method is no longer available.",
      "pay.needName": "Name this payout method.",
      "sec.qa": "Simulate login mode",
      "sec.passwordMode": "Email + password login",
      "sec.socialMode": "Social login only (no password set)",
      "sec.passwordTitle": "Change password",
      "sec.passwordHelp": "Test password: Seller@123",
      "sec.current": "Current password",
      "sec.new": "New password",
      "sec.confirm": "Confirm password",
      "sec.update": "Update password",
      "sec.twofa": "Two-factor authentication",
      "sec.twofaHelp": "Turning this on or off asks for the test code 123456.",
      "sec.socialTitle": "Connected accounts",
      "sec.socialHelp": "One Google account, one Facebook account, and one Apple ID.",
      "sec.link": "Link",
      "sec.unlink": "Unlink",
      "sec.notLinked": "Not linked",
      "sec.devices": "Active devices",
      "sec.currentDevice": "Current",
      "sec.unusual": "Unrecognized",
      "sec.simulate": "Simulate unusual login",
      "sec.all": "Log out of all devices",
      "sec.wrong": "Current password does not match.",
      "sec.short": "Use at least 8 characters for the new password.",
      "sec.mismatch": "New password and confirmation do not match.",
      "sec.passwordAlert": "Security alert: your seller password was changed. Email and push sent.",
      "sec.twofaAlert": "Security alert: two-factor authentication was updated. Email and push sent.",
      "sec.linkedAlert": "Security alert: a social account was linked. Email and push sent.",
      "sec.unlinked": "Social account unlinked.",
      "sec.already": "SET-BR-03: This seller already has a {provider} account linked. Unlink it before linking another.",
      "sec.conflict": "SET-BR-03: This social account is already linked to another user.",
      "sec.emailBad": "Enter the social account email.",
      "sec.allAlert": "Security alert: every other device was signed out. Email and push sent.",
      "sec.unusualAlert": "Unrecognized login detected from a new device/location.",
      "sec.emailBadContact": "Enter a valid seller email.",
      "sec.phoneBad": "Use a Myanmar phone number starting with 09.",
      "sup.intro": "Read the current seller policies, then open a support ticket from here.",
      "sup.simulate": "Simulate policy update",
      "sup.terms": "Seller Terms & Policy",
      "sup.privacy": "Privacy Policy",
      "sup.updated": "Last updated",
      "sup.faq": "Seller help",
      "sup.ticket": "Open seller support ticket",
      "sup.subject": "Subject",
      "sup.category": "Category",
      "sup.description": "Description",
      "sup.send": "Submit ticket",
      "sup.catPayout": "Payout",
      "sup.catVerify": "Shop verification",
      "sup.catDispute": "Order dispute",
      "sup.required": "Subject, category, and description are required.",
      "sup.sent": "Support ticket submitted.",
      "sup.none": "No tickets yet.",
      "faq.q1": "When do payouts arrive?",
      "faq.a1": "Payouts are released to the default method after the order is completed and the holding period ends.",
      "faq.q2": "How do I verify the shop?",
      "faq.a2": "Open a Shop verification ticket with your shop documents. Verified shops show the badge on this page.",
      "faq.q3": "How do I dispute an order?",
      "faq.a3": "Open an Order dispute ticket with the order number and what went wrong.",
      "modal.otpTitle": "Verify with a code",
      "modal.otpCopy": "Enter the 6-digit code sent to the seller. Test code: 123456.",
      "modal.otp": "One-time code",
      "modal.verify": "Verify",
      "modal.cancel": "Cancel",
      "modal.otpBad": "That code does not match. Use 123456 in this demo.",
      "modal.socialTitle": "Link social account",
      "modal.socialEmail": "Account email",
      "modal.link": "Link account",
      "modal.policyTitle": "Updated seller policies",
      "modal.policyCopy": "A new policy version needs your acceptance before you continue.",
      "modal.policyAccept": "I have read and accept the updated policies",
      "modal.policyHint": "Scroll to the end of the policies to accept.",
      "modal.policyToast": "Policy update: Seller Terms and Privacy Policy have a new version.",
      "modal.sessionTitle": "Session cleared",
      "modal.sessionCopy": "This sign-out revoked the session, access token, and refresh token on this browser.",
      "modal.signIn": "Sign back in (demo)",
      "modal.signedIn": "Demo session restored.",
      "modal.allTitle": "Log out of all devices?",
      "modal.allCopy": "Other active sessions will be removed. This browser stays signed in.",
      "modal.allConfirm": "Log out other devices",
      "contact.saved": "Seller contact updated.",
      "google": "Google",
      "facebook": "Facebook",
      "apple": "Apple ID"
    },
    my: {
      "page.title": "ဆက်တင်များ",
      "nav.account": "ဆိုင်နှင့် အကောင့်",
      "nav.preferences": "နှစ်သက်မှုများ",
      "nav.notifications": "အကြောင်းကြားချက်များ",
      "nav.payout": "ငွေထုတ်နှင့် ငွေပေးချေမှု",
      "nav.security": "လုံခြုံရေး",
      "nav.support": "အထောက်အပံ့နှင့် စည်းမျဉ်း",
      "nav.logout": "ထွက်ရန်",
      "summary.verified": "အတည်ပြုပြီးသော ရောင်းသူ",
      "summary.authPassword": "အီးမေးလ်နှင့် စကားဝှက်",
      "summary.authSocial": "လူမှုကွန်ရက်သာ",
      "account.kicker": "ဆိုင်ပရိုဖိုင်",
      "account.title": "ဆိုင်အမှတ်တံဆိပ်၊ ဇာတ်လမ်း၊ တည်ထောင်သူ၊ မူဝါဒနှင့် နားချိန်မုဒ်ကို ပြင်ဆင်ပါ",
      "account.open": "ဆိုင်ပရိုဖိုင်ဖွင့်ရန်",
      "account.contact": "ရောင်းသူ ဆက်သွယ်ရန်",
      "account.contactHelp": "အီးမေးလ်နှင့် ဖုန်းပြောင်းလဲမှုအတွက် ဂဏန်း ၆ လုံးကုဒ် လိုအပ်သည်။ စမ်းသပ်ကုဒ် 123456။",
      "account.email": "ရောင်းသူ အီးမေးလ်",
      "account.phone": "မြန်မာဖုန်း",
      "account.saveEmail": "အီးမေးလ်ပြင်ရန်",
      "account.savePhone": "ဖုန်းပြင်ရန်",
      "pref.intro": "ဘာသာစကားနှင့် အပြင်အဆင်သည် ချက်ချင်းပြောင်းပြီး ဤဘရောက်ဇာတွင် ရှိနေသည်။",
      "pref.language": "ဘာသာစကား",
      "pref.theme": "အပြင်အဆင်",
      "pref.light": "အလင်း",
      "pref.dark": "အမှောင်",
      "pref.system": "စနစ်အတိုင်း",
      "pref.systemHelp": "စနစ်သည် ဤစက်၏ အလင်း သို့မဟုတ် အမှောင်အပြင်အဆင်ကို လိုက်နာသည်။",
      "note.intro": "ပြောင်းလဲမှုတိုင်းကို ချက်ချင်းသိမ်းသည်။",
      "note.order": "အော်ဒါအပ်ဒိတ်",
      "note.orderHelp": "အော်ဒါအသစ်၊ ပယ်ဖျက်မှု၊ ပြန်ပို့တောင်းဆိုမှုနှင့် ငွေထုတ်မှု။",
      "note.promo": "ပရိုမိုးရှင်းနှင့် ကမ်ပိန်း",
      "note.promoHelp": "ဖလက်ရှ်ဆဲလ်ဖိတ်ကြားချက်နှင့် ရောင်းသူကမ်ပိန်း။",
      "note.system": "စနစ်နှင့် လုံခြုံရေး",
      "note.systemHelp": "မူဝါဒအပ်ဒိတ်၊ ဝင်ရောက်မှုသတိပေးချက်နှင့် အဖွဲ့တာဝန်ပြောင်းလဲမှု။",
      "note.email": "အီးမေးလ်",
      "note.sms": "စာတို",
      "note.push": "ပုရှ်",
      "note.saved": "အကြောင်းကြားချက်များကို သိမ်းပြီးပါပြီ။",
      "pay.intro": "အကောင့်နံပါတ်များကို ဖုံးထားသည်။ နောက်ဆုံးဂဏန်း ၄ လုံးသာ သိမ်းသည်။",
      "pay.add": "ငွေထုတ်နည်းထည့်ရန်",
      "pay.kind": "အမျိုးအစား",
      "pay.label": "အမည်",
      "pay.number": "အကောင့် သို့မဟုတ် ကတ်နံပါတ်",
      "pay.save": "သိမ်းမည်",
      "pay.wallet": "မိုဘိုင်းပိုက်ဆံအိတ်",
      "pay.bank": "ဘဏ်အကောင့်",
      "pay.card": "ကုမ္ပဏီကတ်",
      "pay.default": "ပင်မ",
      "pay.make": "ပင်မလုပ်ရန်",
      "pay.remove": "ဖယ်ရှားရန်",
      "pay.empty": "ငွေထုတ်နည်း မရှိသေးပါ။",
      "pay.added": "ငွေထုတ်နည်းကို သိမ်းပြီးပါပြီ။",
      "pay.defaultSet": "ပင်မငွေထုတ်နည်းကို ပြင်ပြီးပါပြီ။",
      "pay.promoted": "ပင်မနည်းကို ဖယ်ရှားထားသောကြောင့် နောက်တစ်ခုကို ပင်မအဖြစ် ထားလိုက်သည်။",
      "pay.short": "ဂဏန်း အနည်းဆုံး ၄ လုံးထည့်ပါ။ နောက်ဆုံး ၄ လုံးသာ သိမ်းသည်။",
      "pay.missing": "ထိုငွေထုတ်နည်း မရှိတော့ပါ။",
      "pay.needName": "ငွေထုတ်နည်းကို အမည်ပေးပါ။",
      "sec.qa": "ဝင်ရောက်မှုပုံစံကို စမ်းသပ်ရန်",
      "sec.passwordMode": "အီးမေးလ်နှင့် စကားဝှက်",
      "sec.socialMode": "လူမှုကွန်ရက်သာ (စကားဝှက်မရှိ)",
      "sec.passwordTitle": "စကားဝှက်ပြောင်းရန်",
      "sec.passwordHelp": "စမ်းသပ်စကားဝှက် Seller@123",
      "sec.current": "လက်ရှိ စကားဝှက်",
      "sec.new": "စကားဝှက်အသစ်",
      "sec.confirm": "စကားဝှက်အသစ် အတည်ပြုရန်",
      "sec.update": "စကားဝှက်ပြင်မည်",
      "sec.twofa": "နှစ်ဆင့်အတည်ပြုခြင်း",
      "sec.twofaHelp": "ဖွင့်ခြင်း သို့မဟုတ် ပိတ်ခြင်းအတွက် စမ်းသပ်ကုဒ် 123456 လိုအပ်သည်။",
      "sec.socialTitle": "ချိတ်ဆက်ထားသော အကောင့်များ",
      "sec.socialHelp": "Google တစ်ခု၊ Facebook တစ်ခုနှင့် Apple ID တစ်ခု။",
      "sec.link": "ချိတ်ဆက်ရန်",
      "sec.unlink": "ဖြုတ်ရန်",
      "sec.notLinked": "မချိတ်ဆက်ရသေး",
      "sec.devices": "အသုံးပြုနေသော စက်များ",
      "sec.currentDevice": "လက်ရှိစက်",
      "sec.unusual": "မသိသော",
      "sec.simulate": "မသိသော ဝင်ရောက်မှုကို စမ်းသပ်ရန်",
      "sec.all": "စက်အားလုံးမှ ထွက်ရန်",
      "sec.wrong": "လက်ရှိ စကားဝှက် မမှန်ပါ။",
      "sec.short": "စကားဝှက်အသစ်သည် အနည်းဆုံး စာလုံး ၈ လုံး ဖြစ်ရမည်။",
      "sec.mismatch": "စကားဝှက်အသစ်နှင့် အတည်ပြုချက် မတူပါ။",
      "sec.passwordAlert": "လုံခြုံရေးသတိပေးချက်။ စကားဝှက်ပြောင်းပြီးပါပြီ။ အီးမေးလ်နှင့် ပုရှ်ပို့ပြီးပါပြီ။",
      "sec.twofaAlert": "လုံခြုံရေးသတိပေးချက်။ နှစ်ဆင့်အတည်ပြုခြင်းကို ပြင်ပြီးပါပြီ။ အီးမေးလ်နှင့် ပုရှ်ပို့ပြီးပါပြီ။",
      "sec.linkedAlert": "လုံခြုံရေးသတိပေးချက်။ လူမှုကွန်ရက်အကောင့် ချိတ်ဆက်ပြီးပါပြီ။ အီးမေးလ်နှင့် ပုရှ်ပို့ပြီးပါပြီ။",
      "sec.unlinked": "လူမှုကွန်ရက်အကောင့်ကို ဖြုတ်ပြီးပါပြီ။",
      "sec.already": "SET-BR-03: ဤရောင်းသူတွင် {provider} အကောင့် ချိတ်ဆက်ပြီးသားဖြစ်သည်။ အသစ်မချိတ်မီ ဖြုတ်ပါ။",
      "sec.conflict": "SET-BR-03: ဤလူမှုကွန်ရက်အကောင့်သည် အခြားအသုံးပြုသူနှင့် ချိတ်ဆက်ပြီးသားဖြစ်သည်။",
      "sec.emailBad": "လူမှုကွန်ရက်အကောင့်၏ အီးမေးလ်ကို ထည့်ပါ။",
      "sec.allAlert": "လုံခြုံရေးသတိပေးချက်။ အခြားစက်များမှ ထွက်ပြီးပါပြီ။ အီးမေးလ်နှင့် ပုရှ်ပို့ပြီးပါပြီ။",
      "sec.unusualAlert": "စက်အသစ် သို့မဟုတ် နေရာအသစ်မှ မသိသော ဝင်ရောက်မှုကို တွေ့ရှိသည်။",
      "sec.emailBadContact": "ရောင်းသူအီးမေးလ် မှန်ကန်စွာ ထည့်ပါ။",
      "sec.phoneBad": "09 ဖြင့် စသော မြန်မာဖုန်းနံပါတ်ကို သုံးပါ။",
      "sup.intro": "ရောင်းသူမူဝါဒကို ဖတ်ပြီး ဤနေရာမှ အကူအညီလက်မှတ်ဖွင့်ပါ။",
      "sup.simulate": "မူဝါဒအပ်ဒိတ်ကို စမ်းသပ်ရန်",
      "sup.terms": "ရောင်းသူ စည်းကမ်းနှင့် မူဝါဒ",
      "sup.privacy": "ကိုယ်ရေးလုံခြုံမှု မူဝါဒ",
      "sup.updated": "နောက်ဆုံးပြင်ဆင်ချိန်",
      "sup.faq": "ရောင်းသူအကူအညီ",
      "sup.ticket": "ရောင်းသူအကူအညီလက်မှတ်ဖွင့်ရန်",
      "sup.subject": "ခေါင်းစဉ်",
      "sup.category": "အမျိုးအစား",
      "sup.description": "ဖော်ပြချက်",
      "sup.send": "လက်မှတ်ပို့မည်",
      "sup.catPayout": "ငွေထုတ်",
      "sup.catVerify": "ဆိုင်အတည်ပြုခြင်း",
      "sup.catDispute": "အော်ဒါအငြင်းပွားမှု",
      "sup.required": "ခေါင်းစဉ်၊ အမျိုးအစားနှင့် ဖော်ပြချက် လိုအပ်သည်။",
      "sup.sent": "အကူအညီလက်မှတ်ကို ပို့ပြီးပါပြီ။",
      "sup.none": "လက်မှတ် မရှိသေးပါ။",
      "faq.q1": "ငွေထုတ်မှု ဘယ်တော့ရောက်သလဲ။",
      "faq.a1": "အော်ဒါပြီးဆုံးပြီး စောင့်ဆိုင်းကာလကုန်မှ ပင်မနည်းလမ်းသို့ ငွေထုတ်သည်။",
      "faq.q2": "ဆိုင်ကို ဘယ်လိုအတည်ပြုသလဲ။",
      "faq.a2": "ဆိုင်စာရွက်စာတမ်းများနှင့်အတူ ဆိုင်အတည်ပြုခြင်းလက်မှတ်ဖွင့်ပါ။",
      "faq.q3": "အော်ဒါကို ဘယ်လိုအငြင်းပွားသလဲ။",
      "faq.a3": "အော်ဒါနံပါတ်နှင့် ဖြစ်စဉ်ကို ထည့်ပြီး အော်ဒါအငြင်းပွားမှုလက်မှတ်ဖွင့်ပါ။",
      "modal.otpTitle": "ကုဒ်ဖြင့် အတည်ပြုရန်",
      "modal.otpCopy": "ရောင်းသူထံပို့သော ဂဏန်း ၆ လုံးကို ထည့်ပါ။ စမ်းသပ်ကုဒ် 123456။",
      "modal.otp": "တစ်ခါသုံးကုဒ်",
      "modal.verify": "အတည်ပြုမည်",
      "modal.cancel": "မလုပ်တော့ပါ",
      "modal.otpBad": "ကုဒ်မမှန်ပါ။ ဤစမ်းသပ်မှုတွင် 123456 ကို သုံးပါ။",
      "modal.socialTitle": "လူမှုကွန်ရက်အကောင့် ချိတ်ဆက်ရန်",
      "modal.socialEmail": "အကောင့်အီးမေးလ်",
      "modal.link": "ချိတ်ဆက်မည်",
      "modal.policyTitle": "ရောင်းသူမူဝါဒ အသစ်",
      "modal.policyCopy": "ဆက်လက်အသုံးပြုရန် မူဝါဒဗားရှင်းအသစ်ကို လက်ခံပါ။",
      "modal.policyAccept": "မူဝါဒအသစ်ကို ဖတ်ပြီး လက်ခံပါသည်",
      "modal.policyHint": "လက်ခံရန် မူဝါဒအဆုံးထိ ဆွဲကြည့်ပါ။",
      "modal.policyToast": "မူဝါဒအပ်ဒိတ်။ ရောင်းသူစည်းကမ်းနှင့် ကိုယ်ရေးလုံခြုံမှုမူဝါဒ ဗားရှင်းအသစ်ရှိသည်။",
      "modal.sessionTitle": "ဆက်ရှင်ရှင်းပြီးပါပြီ",
      "modal.sessionCopy": "ဤထွက်ခြင်းသည် ဤဘရောက်ဇာရှိ ဆက်ရှင်၊ access token နှင့် refresh token ကို ပယ်ဖျက်သည်။",
      "modal.signIn": "ပြန်ဝင်ရန် (စမ်းသပ်)",
      "modal.signedIn": "စမ်းသပ်ဆက်ရှင်ကို ပြန်ထားပြီးပါပြီ။",
      "modal.allTitle": "စက်အားလုံးမှ ထွက်မလား။",
      "modal.allCopy": "အခြားဆက်ရှင်များကို ဖယ်ရှားမည်။ ဤဘရောက်ဇာတွင် ဆက်ရှိနေမည်။",
      "modal.allConfirm": "အခြားစက်များမှ ထွက်မည်",
      "contact.saved": "ရောင်းသူဆက်သွယ်ရန်အချက်ကို ပြင်ပြီးပါပြီ။",
      "google": "Google",
      "facebook": "Facebook",
      "apple": "Apple ID"
    }
  };

  var DOCS = {
    en: {
      terms: {
        updated: "12 Nov 2026",
        paragraphs: [
          "These Seller Terms cover how Atelier Noir lists products, receives orders, and requests payouts on Stylex.",
          "Sellers are responsible for accurate prices, stock, product photos, and delivery promises shown to buyers.",
          "Payouts are sent only to the default payout method. A shop with one or more methods always keeps exactly one default.",
          "Stylex may hold a payout while an order dispute or a verification review is open.",
          "Continuing to sell after a policy update requires the seller to accept the new version."
        ]
      },
      privacy: {
        updated: "12 Nov 2026",
        paragraphs: [
          "Stylex stores the seller account email, phone, shop profile, and masked payout details.",
          "Full bank account numbers and full card numbers are never stored or shown. Only the last 4 digits remain.",
          "Login alerts, policy updates, and team changes can be sent by email, SMS, or push according to the seller’s notification settings.",
          "Connected Google, Facebook, and Apple accounts are limited to one account for each provider.",
          "Signing out clears the session and tokens on this browser. Signing out of all devices removes every other active session."
        ]
      }
    },
    my: {
      terms: {
        updated: "၁၂ နိုဝင်ဘာ ၂၀၂၆",
        paragraphs: [
          "ဤရောင်းသူစည်းကမ်းသည် Stylex ပေါ်တွင် ကုန်ပစ္စည်းတင်ခြင်း၊ အော်ဒါလက်ခံခြင်းနှင့် ငွေထုတ်တောင်းခံခြင်းကို ကာကွယ်သည်။",
          "ရောင်းသူသည် ဈေးနှုန်း၊ လက်ကျန်၊ ဓာတ်ပုံနှင့် ပို့ဆောင်မည့်ကတိကို မှန်ကန်စွာ ပြရမည်။",
          "ငွေထုတ်မှုကို ပင်မငွေထုတ်နည်းသို့သာ ပို့သည်။ နည်းလမ်းတစ်ခုနှင့်အထက်ရှိလျှင် ပင်မတစ်ခုတည်း ရှိရမည်။",
          "အငြင်းပွားမှု သို့မဟုတ် အတည်ပြုစစ်ဆေးမှု ဖွင့်ထားစဉ် ငွေထုတ်မှုကို ဆိုင်းငံ့နိုင်သည်။",
          "မူဝါဒအသစ်ထွက်ပြီးနောက် ဆက်လက်ရောင်းချရန် ထိုဗားရှင်းကို လက်ခံရမည်။"
        ]
      },
      privacy: {
        updated: "၁၂ နိုဝင်ဘာ ၂၀၂၆",
        paragraphs: [
          "Stylex သည် ရောင်းသူအီးမေးလ်၊ ဖုန်း၊ ဆိုင်ပရိုဖိုင်နှင့် ဖုံးထားသော ငွေထုတ်အချက်အလက်ကို သိမ်းသည်။",
          "ဘဏ်အကောင့်အပြည့်နှင့် ကတ်နံပါတ်အပြည့်ကို မသိမ်းပါ၊ မပြပါ။ နောက်ဆုံးဂဏန်း ၄ လုံးသာ ကျန်သည်။",
          "ဝင်ရောက်မှုသတိပေးချက်၊ မူဝါဒအပ်ဒိတ်နှင့် အဖွဲ့ပြောင်းလဲမှုကို ရောင်းသူရွေးထားသော နည်းလမ်းဖြင့် ပို့သည်။",
          "Google၊ Facebook နှင့် Apple အကောင့်ကို ဝန်ဆောင်မှုတစ်ခုလျှင် တစ်ခုသာ ချိတ်ဆက်နိုင်သည်။",
          "ထွက်ခြင်းသည် ဤဘရောက်ဇာရှိ ဆက်ရှင်နှင့် တိုကင်များကို ရှင်းသည်။ စက်အားလုံးမှ ထွက်ခြင်းသည် အခြားဆက်ရှင်များကို ဖယ်ရှားသည်။"
        ]
      }
    }
  };

  function defaults() {
    return {
      email: "amelia@ateliernoir.com",
      phone: "09123456789",
      password: "Seller@123",
      loginMode: "password",
      twoFactor: false,
      notifications: {
        orders: { email: true, sms: false, push: true },
        promotions: { email: false, sms: false, push: false },
        system: { email: true, sms: true, push: true }
      },
      methods: [
        { id: "pm-kbz", kind: "wallet", label: "KBZPay", last4: "8891", isDefault: true },
        { id: "pm-aya", kind: "bank", label: "AYA Bank", last4: "1234", isDefault: false },
        { id: "pm-card", kind: "card", label: "Corporate card", last4: "4421", isDefault: false }
      ],
      oauth: { google: "", facebook: "", apple: "amelia@icloud.com" },
      devices: [
        { id: "dev-mac", name: "MacBook Pro", place: "Yangon, Myanmar", current: true, unusual: false },
        { id: "dev-phone", name: "iPhone 16 Pro", place: "Yangon", current: false, unusual: false },
        { id: "dev-win", name: "Windows PC", place: "Bangkok, Thailand", current: false, unusual: true }
      ],
      tickets: []
    };
  }

  function load() {
    var base = defaults();
    try {
      var saved = JSON.parse(localStorage.getItem(KEY) || "null");
      if (!saved) return base;
      Object.keys(base).forEach(function (key) {
        if (saved[key] !== undefined) base[key] = saved[key];
      });
      base.methods = (base.methods || []).map(function (item) {
        return {
          id: item.id,
          kind: item.kind,
          label: item.label,
          last4: String(item.last4 || "").slice(-4),
          isDefault: Boolean(item.isDefault)
        };
      });
    } catch (error) {}
    return base;
  }

  function save() {
    var copy = JSON.parse(JSON.stringify(state));
    copy.methods = copy.methods.map(function (item) {
      return { id: item.id, kind: item.kind, label: item.label, last4: item.last4, isDefault: item.isDefault };
    });
    localStorage.setItem(KEY, JSON.stringify(copy));
  }

  function t(key) {
    var lang = document.documentElement.lang === "my" ? "my" : "en";
    return (I18N[lang] && I18N[lang][key]) || I18N.en[key] || key;
  }

  function toast(message) {
    if (window.showToast) window.showToast(message);
  }

  function profile() {
    try {
      return JSON.parse(localStorage.getItem("stylex-shop-profile") || "null") || {};
    } catch (error) {
      return {};
    }
  }

  function mask(item) {
    if (item.kind === "card") return "**** **** **** " + item.last4;
    return "**** **** " + item.last4;
  }

  function applyI18n() {
    document.querySelectorAll("[data-i18n]").forEach(function (node) {
      node.textContent = t(node.getAttribute("data-i18n"));
    });
    var title = document.querySelector("[data-bind='page-title']");
    if (title) title.textContent = t("page.title");
    document.title = t("page.title") + " · Stylex";
  }

  function renderSummary() {
    var shop = profile();
    var name = shop.name || "Atelier Noir";
    document.getElementById("set-shop-name").textContent = name;
    document.getElementById("set-email").textContent = state.email;
    var logo = document.getElementById("set-logo");
    logo.replaceChildren();
    if (shop.logo) {
      var image = document.createElement("img");
      image.src = shop.logo;
      image.alt = "";
      logo.appendChild(image);
    } else {
      logo.textContent = name.slice(0, 2).toUpperCase();
    }
    document.getElementById("set-auth-method").textContent = state.loginMode === "social" ? t("summary.authSocial") : t("summary.authPassword");
    document.getElementById("set-auth-method").setAttribute("data-i18n", state.loginMode === "social" ? "summary.authSocial" : "summary.authPassword");
  }

  function renderAccount() {
    document.getElementById("seller-email").value = state.email;
    document.getElementById("seller-phone").value = state.phone;
  }

  function renderChoices() {
    var lang = localStorage.getItem("stylex-lang") === "my" ? "my" : "en";
    document.querySelectorAll("[data-lang-choice]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.langChoice === lang));
    });
    var theme = "light";
    try { theme = localStorage.getItem("stylex-theme") || "light"; } catch (error) {}
    document.querySelectorAll("[data-theme-choice]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.themeChoice === theme));
    });
  }

  function renderNotes() {
    document.querySelectorAll("[data-note]").forEach(function (input) {
      var group = state.notifications[input.dataset.note];
      input.checked = Boolean(group && group[input.dataset.channel]);
    });
  }

  function renderPayments() {
    var list = document.getElementById("payment-list");
    list.replaceChildren();
    if (!state.methods.length) {
      var empty = document.createElement("p");
      empty.className = "settings-help";
      empty.textContent = t("pay.empty");
      list.appendChild(empty);
      return;
    }
    state.methods.forEach(function (item) {
      var row = document.createElement("article");
      row.className = "settings-pay";
      var copy = document.createElement("div");
      var name = document.createElement("strong");
      name.textContent = item.label;
      var number = document.createElement("p");
      number.className = "settings-code";
      number.textContent = mask(item);
      copy.append(name, number);
      var actions = document.createElement("div");
      actions.className = "settings-row-actions";
      if (item.isDefault) {
        var badge = document.createElement("span");
        badge.className = "pill";
        badge.textContent = t("pay.default");
        actions.appendChild(badge);
      } else {
        var make = document.createElement("button");
        make.type = "button";
        make.className = "btn is-ghost";
        make.textContent = t("pay.make");
        make.addEventListener("click", function () { setDefaultPayment(item.id); });
        actions.appendChild(make);
      }
      var remove = document.createElement("button");
      remove.type = "button";
      remove.className = "btn is-ghost";
      remove.textContent = t("pay.remove");
      remove.addEventListener("click", function () { managePaymentMethods("remove", { id: item.id }); });
      actions.appendChild(remove);
      row.append(copy, actions);
      list.appendChild(row);
    });
  }

  function renderSecurity() {
    var social = state.loginMode === "social";
    document.getElementById("password-block").hidden = social;
    document.getElementById("login-mode").value = state.loginMode;
    document.getElementById("twofa-toggle").checked = state.twoFactor;
    ["google", "facebook", "apple"].forEach(function (provider) {
      var status = document.querySelector('[data-oauth-status="' + provider + '"]');
      var button = document.querySelector('[data-oauth-action="' + provider + '"]');
      var linked = state.oauth[provider];
      if (status) status.textContent = linked || t("sec.notLinked");
      if (button) button.textContent = linked ? t("sec.unlink") : t("sec.link");
    });
    var devices = document.getElementById("device-list");
    devices.replaceChildren();
    state.devices.forEach(function (item) {
      var row = document.createElement("article");
      row.className = "settings-device";
      var copy = document.createElement("div");
      var name = document.createElement("strong");
      name.textContent = item.name;
      var place = document.createElement("small");
      place.textContent = item.place;
      copy.append(name, place);
      var flags = document.createElement("div");
      flags.className = "settings-row-actions";
      if (item.current) flags.appendChild(pill(t("sec.currentDevice")));
      if (item.unusual) flags.appendChild(pill(t("sec.unusual")));
      row.append(copy, flags);
      devices.appendChild(row);
    });
  }

  function pill(text) {
    var node = document.createElement("span");
    node.className = "pill";
    node.textContent = text;
    return node;
  }

  function renderDocs(docType) {
    var lang = document.documentElement.lang === "my" ? "my" : "en";
    var doc = (DOCS[lang] && DOCS[lang][docType]) || DOCS.en[docType];
    var body = document.getElementById("legal-body");
    body.replaceChildren();
    doc.paragraphs.forEach(function (paragraph) {
      var p = document.createElement("p");
      p.textContent = paragraph;
      body.appendChild(p);
    });
    document.getElementById("legal-updated").textContent = t("sup.updated") + " · " + doc.updated;
    document.querySelectorAll("[data-doc]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.doc === docType));
    });
    return doc;
  }

  function renderTickets() {
    var list = document.getElementById("ticket-list");
    list.replaceChildren();
    if (!state.tickets.length) {
      var empty = document.createElement("p");
      empty.className = "settings-help";
      empty.textContent = t("sup.none");
      list.appendChild(empty);
      return;
    }
    state.tickets.forEach(function (ticket) {
      var row = document.createElement("article");
      row.className = "settings-ticket";
      var copy = document.createElement("div");
      var title = document.createElement("strong");
      title.textContent = ticket.subject;
      var meta = document.createElement("p");
      meta.textContent = ticket.id + " · " + ticket.category;
      copy.append(title, meta);
      row.append(copy, pill(ticket.status));
      list.appendChild(row);
    });
  }

  function renderDynamic() {
    renderSummary();
    renderAccount();
    renderChoices();
    renderNotes();
    renderPayments();
    renderSecurity();
    renderDocs(document.getElementById("legal-body").dataset.doc || "terms");
    renderTickets();
    fillPolicy();
  }

  function showSection(name) {
    document.querySelectorAll("[data-section]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.section === name));
    });
    document.querySelectorAll("[data-panel]").forEach(function (panel) {
      panel.hidden = panel.dataset.panel !== name;
    });
  }

  function openModal(id) {
    document.getElementById(id).hidden = false;
  }

  function closeModal(id) {
    document.getElementById(id).hidden = true;
  }

  function showError(id, message) {
    var node = document.getElementById(id);
    node.hidden = !message;
    node.textContent = message || "";
  }

  function changeLanguage(langCode) {
    var lang = langCode === "my" ? "my" : "en";
    document.documentElement.lang = lang;
    try { localStorage.setItem("stylex-lang", lang); } catch (error) {}
    document.querySelectorAll(".lang-pills [data-lang]").forEach(function (button) {
      button.setAttribute("aria-pressed", String(button.dataset.lang === lang));
    });
    applyI18n();
    renderDynamic();
    return lang;
  }

  function switchTheme(themeMode) {
    var mode = themeMode === "dark" || themeMode === "system" ? themeMode : "light";
    var dark = mode === "dark" || (mode === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    try { localStorage.setItem("stylex-theme", mode); } catch (error) {}
    if (dark) document.documentElement.setAttribute("data-theme", "dark");
    else document.documentElement.removeAttribute("data-theme");
    document.documentElement.dataset.themeChoice = mode;
    var meta = document.querySelector('meta[name="theme-color"]');
    if (meta) meta.setAttribute("content", dark ? "#0d0d0d" : "#f7f6f4");
    var themeSwitch = document.getElementById("theme-switch");
    var themeLabel = document.getElementById("theme-switch-label");
    if (themeSwitch) {
      themeSwitch.setAttribute("aria-checked", String(dark));
      themeSwitch.setAttribute("aria-label", dark ? "Switch to light theme" : "Switch to dark theme");
    }
    if (themeLabel) themeLabel.textContent = dark ? "Dark theme" : "Light theme";
    if (window.applyStylexTheme) window.applyStylexTheme(mode);
    renderChoices();
    return mode;
  }

  function updateNotificationPreferences(preferencesObj) {
    ["orders", "promotions", "system"].forEach(function (group) {
      if (!preferencesObj[group]) return;
      ["email", "sms", "push"].forEach(function (channel) {
        if (typeof preferencesObj[group][channel] === "boolean") {
          state.notifications[group][channel] = preferencesObj[group][channel];
        }
      });
    });
    save();
    renderNotes();
    toast(t("note.saved"));
    return state.notifications;
  }

  function managePaymentMethods(action, methodData) {
    methodData = methodData || {};
    if (action === "add") {
      var label = String(methodData.label || "").trim();
      var digits = String(methodData.number || "").replace(/\D/g, "");
      if (!label) return { ok: false, error: t("pay.needName") };
      if (digits.length < 4) return { ok: false, error: t("pay.short") };
      var created = {
        id: "pm-" + Date.now(),
        kind: methodData.kind || "bank",
        label: label,
        last4: digits.slice(-4),
        isDefault: state.methods.length === 0
      };
      state.methods.push(created);
      save();
      renderPayments();
      toast(t("pay.added"));
      return { ok: true, method: { id: created.id, label: created.label, number: mask(created), isDefault: created.isDefault } };
    }
    if (action === "remove") {
      var index = state.methods.findIndex(function (item) { return item.id === methodData.id; });
      if (index < 0) return { ok: false, error: t("pay.missing") };
      var wasDefault = state.methods[index].isDefault;
      state.methods.splice(index, 1);
      if (wasDefault && state.methods.length) {
        state.methods[0].isDefault = true;
        toast(t("pay.promoted"));
      }
      save();
      renderPayments();
      return { ok: true };
    }
    return { ok: false, error: "Unknown action" };
  }

  function setDefaultPayment(methodId) {
    if (!state.methods.some(function (item) { return item.id === methodId; })) {
      return { ok: false, error: t("pay.missing") };
    }
    state.methods.forEach(function (item) { item.isDefault = item.id === methodId; });
    save();
    renderPayments();
    toast(t("pay.defaultSet"));
    return { ok: true };
  }

  function changePassword(currentPass, newPass, confirmPass) {
    if (state.loginMode === "social") return { ok: false, error: t("summary.authSocial") };
    if (currentPass !== state.password) return { ok: false, error: t("sec.wrong") };
    if (!newPass || newPass.length < 8) return { ok: false, error: t("sec.short") };
    if (newPass !== confirmPass) return { ok: false, error: t("sec.mismatch") };
    state.password = newPass;
    save();
    toast(t("sec.passwordAlert"));
    return { ok: true };
  }

  function enableTwoFactorAuth(isEnabled, otpCode) {
    if (String(otpCode || "") !== OTP) return { ok: false, error: t("modal.otpBad") };
    state.twoFactor = Boolean(isEnabled);
    save();
    renderSecurity();
    toast(t("sec.twofaAlert"));
    return { ok: true };
  }

  function manageOAuthConnections(provider, action, accountEmail) {
    if (!Object.prototype.hasOwnProperty.call(state.oauth, provider)) return { ok: false, error: "Unknown provider" };
    if (action === "unlink") {
      state.oauth[provider] = "";
      save();
      renderSecurity();
      toast(t("sec.unlinked"));
      return { ok: true };
    }
    var email = String(accountEmail || "").trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { ok: false, error: t("sec.emailBad") };
    if (state.oauth[provider]) {
      return { ok: false, error: t("sec.already").replace("{provider}", t(provider)) };
    }
    if ((TAKEN[provider] || []).indexOf(email) >= 0) return { ok: false, error: t("sec.conflict") };
    state.oauth[provider] = email;
    save();
    renderSecurity();
    toast(t("sec.linkedAlert"));
    return { ok: true };
  }

  function routeToShopProfile() {
    window.location.href = "./shop-profile.html";
  }

  function fetchLegalDocs(docType) {
    var type = docType === "privacy" ? "privacy" : "terms";
    document.getElementById("legal-body").dataset.doc = type;
    return renderDocs(type);
  }

  function openSupportTicket(ticketData) {
    var subject = String(ticketData.subject || "").trim();
    var category = String(ticketData.category || "").trim();
    var description = String(ticketData.description || "").trim();
    if (!subject || !category || !description) return { ok: false, error: t("sup.required") };
    var ticket = {
      id: "TCK-" + String(Date.now()).slice(-6),
      subject: subject,
      category: category,
      description: description,
      status: "Open"
    };
    state.tickets.unshift(ticket);
    save();
    renderTickets();
    toast(t("sup.sent"));
    return { ok: true, ticket: ticket };
  }

  function clearTokenStores() {
    ["localStorage", "sessionStorage"].forEach(function (name) {
      var store = window[name];
      var keys = [];
      for (var i = 0; i < store.length; i += 1) keys.push(store.key(i));
      keys.forEach(function (key) {
        if (key && /session|accessToken|refreshToken/i.test(key)) store.removeItem(key);
      });
    });
  }

  function terminateCurrentSession() {
    clearTokenStores();
    openModal("session-modal");
    return { ok: true };
  }

  function terminateAllSessions() {
    state.devices = state.devices.filter(function (item) { return item.current; });
    try { localStorage.removeItem("refreshToken"); } catch (error) {}
    save();
    renderSecurity();
    toast(t("sec.allAlert"));
    return { ok: true };
  }

  function seedSession() {
    if (!localStorage.getItem("accessToken")) localStorage.setItem("accessToken", "demo-access-token");
    if (!localStorage.getItem("refreshToken")) localStorage.setItem("refreshToken", "demo-refresh-token");
    if (!sessionStorage.getItem("stylex-session")) sessionStorage.setItem("stylex-session", "demo-session");
  }

  function publishedVersion() {
    return localStorage.getItem("stylex-policy-published") || POLICY_FALLBACK;
  }

  function fillPolicy() {
    var lang = document.documentElement.lang === "my" ? "my" : "en";
    var pack = DOCS[lang] || DOCS.en;
    var box = document.getElementById("policy-scroll");
    box.replaceChildren();
    ["terms", "privacy"].forEach(function (type) {
      var heading = document.createElement("p");
      heading.textContent = type === "terms" ? t("sup.terms") : t("sup.privacy");
      box.appendChild(heading);
      pack[type].paragraphs.forEach(function (paragraph) {
        var p = document.createElement("p");
        p.textContent = paragraph;
        box.appendChild(p);
      });
    });
    var accept = document.getElementById("policy-accept");
    accept.disabled = true;
    window.requestAnimationFrame(function () {
      accept.disabled = box.scrollHeight - box.clientHeight <= 8;
    });
  }

  function openPolicy(announce) {
    fillPolicy();
    openModal("policy-modal");
    if (announce) toast(t("modal.policyToast"));
  }

  function checkPolicy() {
    if (localStorage.getItem("stylex-policy-accepted") !== publishedVersion()) openPolicy(false);
  }

  function openOtp(next) {
    pending = next;
    document.getElementById("otp-code").value = "";
    showError("otp-error", "");
    openModal("otp-modal");
  }

  document.getElementById("settings-nav").addEventListener("click", function (event) {
    var button = event.target.closest("[data-section]");
    if (!button) return;
    showSection(button.dataset.section);
  });

  document.getElementById("open-shop-profile").addEventListener("click", routeToShopProfile);
  document.getElementById("settings-logout").addEventListener("click", terminateCurrentSession);
  var headerLogout = document.getElementById("logout-button");
  if (headerLogout) {
    headerLogout.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopPropagation();
      terminateCurrentSession();
    }, true);
  }

  document.getElementById("settings-app").addEventListener("click", function (event) {
    var lang = event.target.closest("[data-lang-choice]");
    var theme = event.target.closest("[data-theme-choice]");
    var doc = event.target.closest("[data-doc]");
    if (lang) changeLanguage(lang.dataset.langChoice);
    if (theme) switchTheme(theme.dataset.themeChoice);
    if (doc) fetchLegalDocs(doc.dataset.doc);
  });

  document.getElementById("note-matrix").addEventListener("change", function (event) {
    var input = event.target.closest("[data-note]");
    if (!input) return;
    var next = JSON.parse(JSON.stringify(state.notifications));
    next[input.dataset.note][input.dataset.channel] = input.checked;
    updateNotificationPreferences(next);
  });

  document.getElementById("payment-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var number = document.getElementById("pay-number");
    var result = managePaymentMethods("add", {
      kind: document.getElementById("pay-kind").value,
      label: document.getElementById("pay-label").value,
      number: number.value
    });
    number.value = "";
    showError("pay-error", result.ok ? "" : result.error);
    if (result.ok) document.getElementById("pay-label").value = "";
  });

  document.getElementById("login-mode").addEventListener("change", function (event) {
    state.loginMode = event.target.value === "social" ? "social" : "password";
    save();
    renderSummary();
    renderSecurity();
  });

  document.getElementById("password-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var result = changePassword(
      document.getElementById("pass-current").value,
      document.getElementById("pass-next").value,
      document.getElementById("pass-confirm").value
    );
    showError("pass-error", result.ok ? "" : result.error);
    if (result.ok) event.target.reset();
  });

  document.getElementById("twofa-toggle").addEventListener("change", function (event) {
    var want = event.target.checked;
    event.target.checked = state.twoFactor;
    openOtp({ type: "2fa", enabled: want });
  });

  document.getElementById("save-email").addEventListener("click", function () {
    var value = document.getElementById("seller-email").value.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
      showError("contact-error", t("sec.emailBadContact"));
      return;
    }
    showError("contact-error", "");
    openOtp({ type: "email", value: value });
  });

  document.getElementById("save-phone").addEventListener("click", function () {
    var value = document.getElementById("seller-phone").value.trim();
    if (!/^09\d{7,9}$/.test(value)) {
      showError("contact-error", t("sec.phoneBad"));
      return;
    }
    showError("contact-error", "");
    openOtp({ type: "phone", value: value });
  });

  document.getElementById("oauth-list").addEventListener("click", function (event) {
    var button = event.target.closest("[data-oauth-action]");
    if (!button) return;
    var provider = button.dataset.oauthAction;
    if (state.oauth[provider]) {
      var removed = manageOAuthConnections(provider, "unlink");
      showError("oauth-error", removed.ok ? "" : removed.error);
      return;
    }
    pending = { type: "oauth", provider: provider };
    document.getElementById("social-email").value = "";
    showError("social-error", "");
    openModal("social-modal");
  });

  document.getElementById("social-form").addEventListener("submit", function (event) {
    event.preventDefault();
    if (!pending || pending.type !== "oauth") return;
    var result = manageOAuthConnections(pending.provider, "link", document.getElementById("social-email").value);
    showError("social-error", result.ok ? "" : result.error);
    if (result.ok) closeModal("social-modal");
  });

  document.getElementById("otp-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var code = document.getElementById("otp-code").value.trim();
    if (!pending) return;
    if (pending.type === "2fa") {
      var twofa = enableTwoFactorAuth(pending.enabled, code);
      showError("otp-error", twofa.ok ? "" : twofa.error);
      if (twofa.ok) closeModal("otp-modal");
      return;
    }
    if (code !== OTP) {
      showError("otp-error", t("modal.otpBad"));
      return;
    }
    if (pending.type === "email") state.email = pending.value;
    if (pending.type === "phone") state.phone = pending.value;
    save();
    renderAccount();
    renderSummary();
    closeModal("otp-modal");
    toast(t("contact.saved"));
  });

  document.getElementById("simulate-login").addEventListener("click", function () {
    state.devices.unshift({
      id: "dev-" + Date.now(),
      name: "Unknown Android",
      place: "Mandalay, Myanmar",
      current: false,
      unusual: true
    });
    save();
    renderSecurity();
    var banner = document.getElementById("unusual-banner");
    banner.hidden = false;
    banner.textContent = t("sec.unusualAlert");
    toast(t("sec.unusualAlert"));
  });

  document.getElementById("open-all-sessions").addEventListener("click", function () {
    openModal("all-modal");
  });
  document.getElementById("confirm-all-sessions").addEventListener("click", function () {
    terminateAllSessions();
    closeModal("all-modal");
  });

  document.getElementById("simulate-policy").addEventListener("click", function () {
    localStorage.setItem("stylex-policy-published", POLICY_FALLBACK + "." + Date.now());
    openPolicy(true);
  });

  document.getElementById("policy-scroll").addEventListener("scroll", function (event) {
    var box = event.currentTarget;
    var atEnd = box.scrollTop + box.clientHeight >= box.scrollHeight - 8;
    document.getElementById("policy-accept").disabled = !atEnd;
  });

  document.getElementById("policy-accept").addEventListener("click", function () {
    localStorage.setItem("stylex-policy-accepted", publishedVersion());
    closeModal("policy-modal");
  });

  document.getElementById("ticket-open").addEventListener("click", function () {
    showError("ticket-error", "");
    openModal("ticket-modal");
  });
  document.getElementById("ticket-form").addEventListener("submit", function (event) {
    event.preventDefault();
    var result = openSupportTicket({
      subject: document.getElementById("ticket-subject").value,
      category: document.getElementById("ticket-category").value,
      description: document.getElementById("ticket-description").value
    });
    showError("ticket-error", result.ok ? "" : result.error);
    if (result.ok) {
      event.target.reset();
      closeModal("ticket-modal");
    }
  });

  document.getElementById("sign-back-in").addEventListener("click", function () {
    localStorage.setItem("accessToken", "demo-access-token");
    localStorage.setItem("refreshToken", "demo-refresh-token");
    sessionStorage.setItem("stylex-session", "demo-session");
    closeModal("session-modal");
    toast(t("modal.signedIn"));
  });

  document.querySelectorAll("[data-close-modal]").forEach(function (button) {
    button.addEventListener("click", function () {
      closeModal(button.dataset.closeModal);
    });
  });

  document.addEventListener("stylex-lang", function (event) {
    if (event.detail) changeLanguage(event.detail);
  });
  document.addEventListener("stylex-theme", renderChoices);
  document.addEventListener("keydown", function (event) {
    if (event.key !== "Escape") return;
    var policyOpen = !document.getElementById("policy-modal").hidden;
    var sessionOpen = !document.getElementById("session-modal").hidden;
    if (policyOpen || sessionOpen) {
      event.preventDefault();
      event.stopPropagation();
    }
  });

  window.changeLanguage = changeLanguage;
  window.switchTheme = switchTheme;
  window.updateNotificationPreferences = updateNotificationPreferences;
  window.managePaymentMethods = managePaymentMethods;
  window.setDefaultPayment = setDefaultPayment;
  window.changePassword = changePassword;
  window.enableTwoFactorAuth = enableTwoFactorAuth;
  window.manageOAuthConnections = manageOAuthConnections;
  window.routeToShopProfile = routeToShopProfile;
  window.fetchLegalDocs = fetchLegalDocs;
  window.openSupportTicket = openSupportTicket;
  window.terminateCurrentSession = terminateCurrentSession;
  window.terminateAllSessions = terminateAllSessions;

  var storedLang = "en";
  try { storedLang = localStorage.getItem("stylex-lang") || "en"; } catch (error) {}
  document.documentElement.lang = storedLang === "my" ? "my" : "en";
  seedSession();
  applyI18n();
  showSection("account");
  renderDynamic();
  checkPolicy();
})();
