# Scientific Research Report — Phase 1

Prepared: 2026-07-30  
Population in scope: adults 18 years and older for whom ordinary self-directed nutrition planning is appropriate.  
Status: evidence synthesis for review; not an approved prescription specification.

## 1. Source hierarchy used

Priority was given to current professional/clinical guidance, consensus statements, systematic reviews/meta-analyses, randomized trials, and authoritative dietary-reference systems. Consumer fitness sites, influencer material, bodybuilding forums, and marketing pages were excluded.

Core sources:

- National Academies of Sciences, Engineering, and Medicine. *Dietary Reference Intakes for Energy* (2023). https://doi.org/10.17226/26818
- WHO. *Healthy diet* (updated 2026-01-26). https://www.who.int/news-room/fact-sheets/detail/healthy-diet
- NICE NG246. *Overweight and obesity management* (2025; updated 2026). https://www.nice.org.uk/guidance/ng246
- NICE CG32. *Nutrition support for adults* (current recommendations page). https://www.nice.org.uk/guidance/cg32
- Thomas DT, Erdman KA, Burke LM. Academy/DC/ACSM position: Nutrition and Athletic Performance (2016). PMID 26920240 / 26891166.
- Jäger R et al. ISSN position stand: protein and exercise (2017). PMID 28642676.
- Morton RW et al. Protein supplementation and resistance-training adaptations: systematic review/meta-regression (2018). PMID 28698222.
- Slater GJ et al. Energy surplus and resistance-training hypertrophy review (2019). PMID 31482093.
- Murphy C, Koehler K. Energy deficiency and resistance-training lean-mass gains: meta-analysis/meta-regression (2022 publication record; PMID 34623696).
- Larson-Meyer DE et al. Weight-gain recommendations for athletes: critical review (2022). PMID 35233712.
- Sanchez AD et al. Randomized trial of healthy weight gain in athletic individuals (2024). PMID 38537251.
- Maughan RJ et al. IOC consensus: dietary supplements and the high-performance athlete (2018). PMID 29540367 / 29589768.
- FAO/INFOODS food-composition guidance and recipe calculation procedures. https://www.fao.org/infoods/
- FAO listing for the 2017 Iranian Food Composition Table. https://www.fao.org/food-composition/tables-and-databases/detail/%28iran--2017%29-iranian-food-composition-table/en

## 2. Shared foundations

### 2.1 Energy requirements

Predictive equations are estimates, not measurements. The 2023 National Academies report provides updated Estimated Energy Requirement equations and explicitly frames EER as an average predicted intake for energy balance in people defined by age, sex, size, activity, and life stage. Mizaneh currently uses Mifflin–St Jeor RMR multiplied by four categorical activity factors. Mifflin remains a defensible RMR equation, but the combined TDEE implementation and categorical activity factors require direct validation against the newer EER framework before being described as the single scientifically preferred method.

Product implication:

- preserve current weight-loss output until an approved migration exists;
- version the current method as a legacy calculation policy;
- compare Mifflin×PAL and 2023 EER equations on representative profiles;
- disclose uncertainty and calibrate against observed trends rather than implying laboratory precision.

### 2.2 Adaptive adjustment

Static calorie-to-weight conversions do not model metabolic adaptation or changing energy expenditure. NIH/NIDDK dynamic modelling literature shows why the traditional 3500 kcal/lb (approximately 7700 kcal/kg) rule overpredicts long-term change.

Product implication:

- the static rule may be retained only as an explicitly rough first-order estimate for legacy output;
- it must not generate a guaranteed timeline;
- future adjustments should use rolling observations and small user-approved changes;
- no change should be triggered from one measurement.

The evidence supports trend-based monitoring as a concept, but does not establish one universal app threshold or adjustment increment. Exact windows and increments are product safety decisions requiring review.

### 2.3 Macronutrients and dietary quality

WHO’s 2026 healthy-diet guidance emphasises adequacy, balance, moderation, and diversity; at least 400 g/day fruits and vegetables and at least 25 g/day naturally occurring fibre for people older than 10; carbohydrate mainly from whole grains, vegetables, fruit, and pulses; saturated fat below 10% energy; trans fat below 1%; and free sugars below 10% energy.

EFSA reference material supports 20–35% energy from fat and 25 g/day fibre as an adequate adult reference.

Product implication:

- calories cannot be the only optimisation target;
- plan generation and post-edit validation need a nutrient-adequacy layer;
- carbohydrate and fat targets should be ranges, not a single unexplained residual;
- the current 80 g carbohydrate floor and mode-specific 30/34% fat values require explicit product rationale or replacement.

### 2.4 Protein quality and distribution

For exercising adults, the ISSN position stand gives 1.4–2.0 g/kg/day as sufficient for most. Morton et al. found diminishing additional fat-free-mass benefit beyond about 1.62 g/kg/day in resistance-training studies. Total daily protein is the primary target; meal distribution is secondary. Position-stand evidence suggests roughly 0.25–0.40 g/kg per feeding every 3–4 hours can support muscle protein synthesis, but this should not become a rigid mandatory meal schedule.

Product implication:

- a muscle-gain default near 1.6 g/kg/day is evidence-aligned for healthy resistance-training adults, subject to medical exclusions and energy adequacy;
- distribution can be an optional planning preference;
- protein should be calculated from an approved body-mass basis and capped by a reviewed range, not silently from target weight plus calorie percentages.

### 2.5 Food-composition data, raw/cooked state, and recipes

FAO/INFOODS states that food composition varies by variety, processing, geography, and preparation. Recipe calculation requires structured ingredient weights, edible portions, raw/cooked state, yields, and nutrient-retention factors. Calculated recipe values are estimates and should be labelled separately from analytical values.

The 2017 Iranian Food Composition Table is listed by FAO but access/licensing must be confirmed before product integration.

Product implication:

- current free-text ingredient arrays cannot support accurate editable nutrition;
- verified, borrowed, calculated, and user-entered values must be distinguishable;
- every food needs provenance, preparation state, serving unit, and completeness metadata;
- custom recipes need yield and serving calculations with uncertainty labels.

## 3. Weight-loss mode

### 3.1 Dietary approach

NICE NG246 requires a flexible, individualised, nutritionally balanced energy deficit, considering culture, preferences, finances, comorbidities, disordered eating, and restrictions. It does not establish one universal percentage deficit. Low-energy diets of 800–1200 kcal/day are reserved for specialist multicomponent services in defined populations, not ordinary self-service planning.

Implications for current rules:

- the existing 20% cap can remain temporarily as preserved legacy behavior, but is not yet approved as a universal scientific constant;
- the 1200/1500 floors are insufficient as the safety boundary and are not a substitute for clinical screening;
- the app must not present weight regain, plateaus, or slower-than-estimated change as user failure;
- weight-loss mode should prioritise nutrient adequacy, adherence, resistance exercise where appropriate, and lean-mass preservation.

### 3.2 Protein and lean mass

Higher protein can support satiety and lean-mass retention during energy restriction, but needs vary with body size, training, age, and energy deficit. For people performing resistance training, sports-nutrition ranges may apply; for general users, the product should avoid automatically applying athlete-level targets without context.

### 3.3 Pace and prediction

No evidence supports promising a precise weekly fat-loss rate to every user. Scale changes include water, glycogen, gastrointestinal contents, fat, and lean tissue. The current projection graph should be reframed as an uncertain scenario or removed from decision-making.

## 4. Muscle-gain mode

### 4.1 Resistance training is required

Nutrition alone does not guarantee hypertrophy. Resistance exercise and adequate protein act synergistically. Muscle-gain onboarding must collect resistance-training status, frequency, experience, and recovery context, and must state that meaningful hypertrophy requires progressive resistance training.

### 4.2 Energy surplus

The evidence does not validate one universal “optimal surplus.” Reviews explicitly identify this as an evidence gap. A common 300–500 kcal/day recommendation exists, and a 2024 randomized trial using an additional 500 kcal/day plus supervised resistance training produced about 0.22 kg/week average total gain, mostly lean mass over ten weeks. This trial does not justify using 500 kcal/day for every user.

Approved direction for specification review:

- use a conservative trial surplus rather than a guaranteed muscle-gain formula;
- prefer a small percentage or bounded increment that can be revised using weight trend, performance, appetite, recovery, and waist/body-composition context;
- do not claim all gain is muscle or that fat gain can be eliminated;
- no exact starting surplus should be implemented until the product owner approves the numerical policy in the calculation registry.

### 4.3 Protein, carbohydrate, fat, timing

- Protein: a default around 1.6 g/kg/day is well supported for healthy resistance-training adults; an allowed range up to 2.0 g/kg/day may support personalisation.
- Carbohydrate: should support training volume and glycogen needs; no single gram-per-kilogram value applies to every recreational lifter.
- Fat: keep within a healthy reference range and do not drive it unnecessarily low.
- Timing: total daily intake is more important than a narrow post-workout window; optional distribution guidance is acceptable.

### 4.4 Monitoring

Monitor at least weight trend, training performance, appetite, recovery, sleep, digestive tolerance, and plan adherence. A plateau in scale weight with improving performance is not automatically a failure; a rapid rise with increasing waist and poor tolerance should not trigger a larger surplus.

## 5. Healthy weight-gain mode

This mode is not muscle gain without the training questions.

### 5.1 Screening first

NICE nutrition-support criteria make low BMI, recent unintentional weight loss, low intake, malabsorption, and refeeding risk clinical concerns. The default app must not generate an ordinary plan for users who may be malnourished, medically unstable, or at refeeding risk.

### 5.2 Strategy within safe automated scope

For users who are medically appropriate and intentionally seeking gradual gain:

- increase energy gradually;
- use nutrient-dense and energy-dense foods;
- adjust portions and meal opportunities based on appetite and tolerance;
- liquids may be useful when appetite limits intake, but should not become a sugar-heavy default;
- do not equate calorie increase with dietary quality;
- monitor digestive symptoms and unexpected weight changes.

Evidence for exact self-service increments is weaker than evidence for screening and nutrition support. The often-quoted 300–500 kcal/day range should be treated as a candidate starting policy, not a settled universal rule.

## 6. Safety boundaries

Hard exclusions are required for:

- age under 18;
- pregnancy or breastfeeding;
- diagnosed or suspected eating disorder;
- unintentional weight loss;
- severe underweight or malnutrition criteria;
- prolonged negligible intake or refeeding risk;
- kidney or liver disease;
- uncontrolled diabetes;
- serious cardiovascular disease;
- active cancer treatment;
- recent major surgery;
- severe gastrointestinal disease, malabsorption, or swallowing difficulty;
- serious food allergy requiring medical nutrition management;
- any condition requiring medical nutrition therapy.

A disclaimer checkbox must not bypass these exclusions.

## 7. Supplements

Supplements must be separate from food planning and never mandatory. IOC guidance recommends a complete nutrition assessment first and notes that only a small number of performance supplements have good evidence in specific contexts, while contamination, adverse effects, and anti-doping violations are real risks.

Product policy:

- no steroids, SARMs, unapproved performance-enhancing substances, unsafe stimulant combinations, or unverifiable mass gainers;
- no automatic supplement recommendation from a generated plan;
- creatine, if ever discussed, must be optional, context-specific, accompanied by safety/quality cautions, and excluded for users outside the ordinary healthy-adult scope;
- micronutrient supplements should not be recommended solely from incomplete meal-catalogue data.

## 8. Review of the repository’s existing research document

The existing `docs/research.md` is not sufficient for the requested expansion because it:

- covers only the legacy weight-loss constants;
- relies partly on consumer-health summaries for calorie floors;
- asserts that fixed activity factors need no change without a primary-source mapping;
- lacks population, certainty, limitations, formula version, and expiry for each rule;
- does not cover muscle gain, healthy weight gain, clinical exclusions, food-composition provenance, editing, or supplements;
- suggests non-blocking handling for some out-of-scope cases, which conflicts with the required hard safety boundary.

It should be preserved as historical audit context, not used as the approval record for new formulas.

## 9. Research conclusions requiring owner review

1. Keep the existing weight-loss calculation unchanged until a migration plan is approved, but label its unsupported constants honestly in technical documentation.
2. Do not approve one exact muscle-gain or healthy-weight-gain surplus yet; the evidence supports a conservative adaptive policy more strongly than a universal number.
3. Approve 1.6 g/kg/day as the leading muscle-gain protein default only for screened, resistance-training adults, with an allowed evidence-based range and contraindication gates.
4. Replace precise linear weight timelines with uncertainty-aware trend guidance.
5. Build the editable-food model only after a licensed/provenanced nutrient-data strategy is approved.
6. Treat clinical exclusions as hard gates, not dismissible advice.
