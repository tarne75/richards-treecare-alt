/* =========================================================================
   Richard's Tree Care — content data
   =========================================================================

   PHASE 1 (now)
     Services and FAQs are hard-coded in this file and rendered by main.js.

   PHASE 2 (later)
     Publish a Google Sheet (File > Share > Publish to web > CSV) and paste the
     resulting URL into RTC_CONFIG below. main.js will fetch and parse the CSV
     and use it instead of the arrays here. If the fetch fails for any reason,
     it silently falls back to the arrays here, so the site can never end up
     showing an empty page.

   SHEET COLUMN HEADERS — must match exactly (lowercase, no spaces)
     Services sheet : title | blurb | points | icon | group
                      `points`  = pipe-separated list, e.g. "Crown reduction|Crown lifting"
                      `icon`    = one of the keys in ICONS in main.js
                                  (saw, crown, pollard, deadwood, fell, stump,
                                   brace, hedge, clearance, storm, woodland,
                                   survey, planning, leaf)
                      `group`   = optional grouping label, currently unused
     FAQ sheet      : question | answer | group

   ========================================================================= */

window.RTC_CONFIG = {
  // Paste the "Publish to web" CSV URLs here in Phase 2.
  // Example: 'https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?gid=0&single=true&output=csv'
  SERVICES_CSV_URL: '',
  FAQ_CSV_URL: '',

  // Columns in the services grid on desktop. 1 column on mobile is automatic.
  SERVICES_GRID_COLUMNS: 2
};

window.RTC_DATA = {

  /* ---------------------------------------------------------------- */
  /* SERVICES                                                          */
  /* ---------------------------------------------------------------- */
  services: [
    {
      icon: 'crown',
      title: 'Tree Pruning & Crown Work',
      blurb: 'The bread and butter of good tree care. Selective, well-placed cuts that reduce weight and let light through without wrecking the tree’s natural shape — or its long-term health.',
      points: [
        'Crown reduction — bringing height and spread back within sensible limits',
        'Crown lifting — raising the lower canopy over paths, drives and lawns',
        'Crown thinning — letting light and wind through a dense canopy',
        'Formative pruning on young trees to set them up for the next fifty years'
      ]
    },
    {
      icon: 'pollard',
      title: 'Pollarding',
      blurb: 'A traditional technique for keeping a large-growing species at a manageable size in a small space. Done at the right point and on the right species it can extend a tree’s life considerably; done badly it ruins one.',
      points: [
        'Suited to willow, poplar, lime, London plane and similar',
        'Re-pollarding of trees already on a cycle',
        'Honest advice on whether pollarding is right for your tree'
      ]
    },
    {
      icon: 'deadwood',
      title: 'Deadwood Removal & Crown Cleaning',
      blurb: 'Dead, dying, diseased and crossing branches taken out of the canopy. This is the single most cost-effective piece of tree work there is — it removes the parts most likely to fall without touching the living structure.',
      points: [
        'Removal of hanging and broken limbs after wind',
        'Clearing epicormic growth and crossing branches',
        'Priority work over paths, parking and play areas'
      ]
    },
    {
      icon: 'fell',
      title: 'Tree Felling & Sectional Dismantling',
      blurb: 'Where there’s room, a tree comes down in one. Where there isn’t — and in most Hertfordshire gardens there isn’t — it comes down in controlled sections, rigged and lowered piece by piece over whatever is underneath it.',
      points: [
        'Straight felling on open ground',
        'Sectional dismantling over greenhouses, sheds, fences and neighbours',
        'Rigging and lowering of heavy limbs',
        'All timber and brash cleared unless you’d like the logs'
      ]
    },
    {
      icon: 'stump',
      title: 'Stump Removal',
      blurb: 'A stump left in a lawn is a trip hazard, a mower-killer and an invitation to honey fungus. Grinding it out below ground level lets you turf, plant or pave straight over the top.',
      points: [
        'Grinding to below ground level so the area can be reinstated',
        'Grindings removed or left to backfill, whichever you prefer',
        'Access checked at the quotation stage — machines need a route in'
      ]
    },
    {
      icon: 'brace',
      title: 'Cable Bracing & Tree Support',
      blurb: 'Not every structurally weak tree needs felling. A well-specified brace can support a weak fork or a heavy limb and buy a valued tree many more years, often at a fraction of the cost of removal.',
      points: [
        'Assessment of weak unions, cavities and included bark',
        'Non-invasive dynamic bracing systems',
        'Combined with reduction work where that’s the better answer'
      ]
    },
    {
      icon: 'hedge',
      title: 'Hedge Cutting & Maintenance',
      blurb: 'From a garden privet to a two-hundred-metre boundary hedge. Cut square, tapered slightly so the base keeps its leaf, and every last clipping taken away.',
      points: [
        'Annual and twice-yearly maintenance cuts',
        'Hard reduction and reshaping of overgrown hedges',
        'Conifer and leylandii height reduction',
        'Nesting birds checked for before work between March and August'
      ]
    },
    {
      icon: 'clearance',
      title: 'Site & Vegetation Clearance',
      blurb: 'Overgrown plots brought back to something you can actually use. Scrub, brambles, self-set saplings, ivy and old hedging cleared and chipped on site.',
      points: [
        'Garden and plot clearance before building or landscaping',
        'Scrub, bramble and self-set sapling removal',
        'Ivy severed and stripped from trees and walls',
        'Everything chipped and removed'
      ]
    },
    {
      icon: 'storm',
      title: 'Storm Damage & Fallen Trees',
      blurb: 'When a tree comes down across a drive, a fence or a roof, the priority is making it safe before anything else. Call me and I will tell you honestly how quickly I can get to you.',
      points: [
        'Windblown and uprooted trees made safe and removed',
        'Hung-up and partly failed limbs taken down under control',
        'Photographs and a written description for your insurer if you need them'
      ]
    },
    {
      icon: 'woodland',
      title: 'Woodland Management',
      blurb: 'Longer-term care for paddocks, copses, orchards and small woodlands — thinning, ride maintenance, replanting and a sensible plan for the next few years rather than a one-off visit.',
      points: [
        'Thinning to favour the best specimens',
        'Ride, track and boundary maintenance',
        'Replanting and establishment of young stock',
        'Phased programmes for estates, schools and commercial grounds'
      ]
    },
    {
      icon: 'survey',
      title: 'Tree Inspections & Reports',
      blurb: 'A written assessment of the condition of a tree or a group of trees, with a clear recommendation. Useful for property purchases, insurers, managing agents and anyone who has been told their tree is dangerous and would like a second opinion.',
      points: [
        'Visual condition assessment of individual trees or a whole site',
        'Written findings with prioritised recommendations',
        'Advice on what genuinely needs doing — and what does not'
      ]
    },
    {
      icon: 'planning',
      title: 'Planning Applications & TPO Enquiries',
      blurb: 'If your tree is protected by a Tree Preservation Order or stands in a conservation area, the council must be notified before work starts. I check this free of charge at the quotation stage and can handle the paperwork for you.',
      points: [
        'Free TPO and conservation area check with every quotation',
        'Section 211 notices and TPO consent applications prepared and submitted',
        'Liaison with the local tree officer on your behalf'
      ]
    }
  ],

  /* ---------------------------------------------------------------- */
  /* FAQs                                                              */
  /* ---------------------------------------------------------------- */
  faqs: [
    {
      question: 'Do I need permission before work is carried out on my tree?',
      answer: 'Sometimes, yes. If your tree is covered by a Tree Preservation Order (TPO) or stands within a conservation area, the local authority has to be notified and in most cases has to give consent before work starts. I check this for you free of charge at the quotation stage, and if consent is needed I can prepare and submit the application on your behalf and deal with the tree officer directly. Please don’t take a chance on it — unauthorised work to a protected tree carries serious fines.'
    },
    {
      question: 'Do you charge for a quotation?',
      answer: 'No. Site visits and quotations are free and carry no obligation. I would much rather come and look at a tree properly than guess over the phone, and if the honest answer is that your tree does not need any work, I will tell you that and it will still have cost you nothing.'
    },
    {
      question: 'Why do quotations from different tree surgeons vary so much?',
      answer: 'Usually because they are not describing the same job. Some firms give a rough estimate over the phone; some price for taking a tree down in one drop where it actually needs rigging out in sections; some are not covering the cost of removing the waste. What I give you is a written quotation for a clearly described scope of work agreed at the site visit — not an estimate. The price does not move unless you ask for additional work and we agree it first.'
    },
    {
      question: 'What happens to all the waste?',
      answer: 'It goes with us. Brash and small branches go through the chipper, and the chip is recycled — typically as biomass fuel or mulch. Timber is cut into manageable lengths and taken away. If you would like the logs left for firewood, say so at the quotation stage and I will leave them cut and stacked, which usually reduces the price slightly.'
    },
    {
      question: 'How much mess will there be?',
      answer: 'Far less than you are expecting. Cleaning up properly is part of the job, not an extra — lawns are raked, hard surfaces are blown down, and I would rather spend an extra half hour tidying than have you looking at sawdust for a fortnight. A good number of my jobs come from neighbours who watched the last one.'
    },
    {
      question: 'Are you insured?',
      answer: 'Yes — £5m public liability insurance is in place for every job, domestic and commercial. Documentation is available on request, and managing agents, schools and local authorities are welcome to ask for it before work is booked.'
    },
    {
      question: 'When is the best time of year to have tree work done?',
      answer: 'For most species, winter — the tree is dormant, the structure is visible without leaves, and there is no risk to nesting birds. There are exceptions: some species are best pruned in late summer, fruit trees have their own timing, and safety work such as removing a hanging limb should never wait for a season. Hedges are usually cut outside the March-to-August bird nesting season, or after a careful check. Tell me what you have and I will advise on timing.'
    },
    {
      question: 'My neighbour’s tree overhangs my garden. What can I do?',
      answer: 'In general you may prune growth back to the boundary line, provided the tree is not protected by a TPO or in a conservation area, and the cuttings legally remain the property of the tree’s owner. In practice a quiet word with your neighbour first saves an enormous amount of grief, and it is often cheaper for the two of you to have the tree done properly together than to have one side hacked back. I am happy to look at it and advise.'
    },
    {
      question: 'How long will the work take?',
      answer: 'Most domestic jobs are done inside a day, and a good many inside half a day. Larger dismantles, hedges over a hundred metres or full site clearances may run to two or three days. Whatever it is, I will tell you at the quotation stage how long I expect to be there and how much access and parking I need.'
    },
    {
      question: 'Do you work on large or awkward trees over buildings?',
      answer: 'Yes — that is a large part of what I do. Where a tree cannot simply be dropped, it is dismantled in sections and rigged down under control over whatever is underneath, whether that is a conservatory, a fence, a pond or a neighbour’s roof. Twenty years of climbing means very little in a domestic garden is genuinely unusual.'
    },
    {
      question: 'Do you take on commercial and public sector work?',
      answer: 'Yes. Alongside domestic gardens I work for commercial grounds, schools, estates and local authorities, and I have worked as a lead climber on large-scale contracts for highway agencies and councils. Risk assessments, method statements and insurance documentation can be provided in advance.'
    },
    {
      question: 'What areas do you cover?',
      answer: 'I am based in Wheathampstead and work mainly across mid-Hertfordshire — St Albans, Harpenden, Hatfield, Welwyn, Welwyn Garden City and the surrounding villages. If you are a little further out it is usually still fine, so please ask rather than assume.'
    },
    {
      question: 'How do I pay, and when?',
      answer: 'On completion, once you are happy with the work. Bank transfer is easiest. For larger commercial jobs, invoicing terms can be agreed in advance.'
    }
  ]
};
