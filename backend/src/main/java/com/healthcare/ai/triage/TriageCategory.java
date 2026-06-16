package com.healthcare.ai.triage;

import java.util.List;

/**
 * Data-driven triage categories. Each maps symptom keywords to platform specialist types
 * and carries informational (non-diagnostic) possible causes, self-care tips and follow-ups.
 *
 * NOTE: This is intentionally informational only — it never asserts a diagnosis.
 */
public enum TriageCategory {

    ORTHOPEDIC("Orthopedic",
            List.of("Orthopedic", "Physiotherapist"),
            List.of("knee", "joint", "bone", "back pain", "backache", "shoulder", "fracture", "sprain",
                    "arthritis", "muscle pain", "neck pain", "hip", "ankle", "wrist", "posture", "ligament", "knee pain"),
            List.of("Muscle strain", "Joint inflammation", "Calcium or Vitamin D deficiency",
                    "Sports or overuse injury", "Posture-related stress", "Age-related wear"),
            List.of("Rest the affected area", "Apply a cold/warm compress", "Gentle stretching",
                    "Avoid excessive strain", "Maintain good posture"),
            List.of("How long has it been hurting?", "Did you have a recent injury or fall?",
                    "Do you play sports or do heavy lifting?", "Rate the pain from 1 to 10.")),

    DERMATOLOGY("Dermatology",
            List.of("Dermatologist", "Skin Specialist"),
            List.of("skin", "rash", "acne", "pimple", "itch", "itchy", "allergy", "eczema",
                    "psoriasis", "mole", "redness", "irritation", "skin problem", "hives"),
            List.of("Allergic reaction", "Skin irritation or contact dermatitis", "Bacterial or fungal involvement",
                    "Dryness or eczema", "Hormonal changes"),
            List.of("Keep the area clean and dry", "Avoid scratching", "Use a gentle, fragrance-free moisturizer",
                    "Stay hydrated", "Avoid known irritants/allergens"),
            List.of("How long have you had this?", "Is it spreading or itchy?",
                    "Any new product, food or medication recently?", "Any swelling or fever with it?")),

    HAIR_CARE("Hair Care",
            List.of("Hair Specialist", "Dermatologist"),
            List.of("hair fall", "hairfall", "hair loss", "dandruff", "baldness", "bald", "scalp", "thinning hair"),
            List.of("Nutritional deficiency (iron, biotin)", "Stress", "Hormonal imbalance",
                    "Scalp condition (dandruff/seborrhea)", "Genetic pattern hair loss"),
            List.of("Eat a protein and iron rich diet", "Avoid harsh chemical treatments",
                    "Manage stress and sleep well", "Use a mild shampoo", "Avoid excessive heat styling"),
            List.of("How long has the hair fall been happening?", "Any dandruff or scalp itching?",
                    "Any recent stress, illness or diet change?", "Is it patchy or all over?")),

    CARDIOLOGY("Cardiology",
            List.of("Cardiologist"),
            List.of("chest pain", "heart", "palpitation", "palpitations", "hypertension",
                    "blood pressure", "cholesterol", "chest tightness"),
            List.of("Stress or anxiety", "Acid reflux", "Blood pressure variation",
                    "Muscular chest strain", "Cardiac-related causes (needs evaluation)"),
            List.of("Avoid exertion until evaluated", "Reduce salt and caffeine", "Track your blood pressure",
                    "Practice calm breathing", "Do not ignore worsening symptoms"),
            List.of("Is the chest pain sudden or severe?", "Any breathlessness or sweating?",
                    "Does it spread to the arm, jaw or back?", "Any history of heart issues?")),

    NEUROLOGY("Neurology",
            List.of("Neurologist"),
            List.of("headache", "migraine", "dizziness", "dizzy", "numbness", "seizure",
                    "tremor", "memory loss", "paralysis", "tingling"),
            List.of("Tension or migraine headache", "Dehydration", "Eye strain",
                    "Stress or lack of sleep", "Neurological causes (needs evaluation)"),
            List.of("Rest in a quiet, dark room", "Stay hydrated", "Maintain regular sleep",
                    "Limit screen time", "Track triggers"),
            List.of("How long and how severe is it?", "Any vision changes, weakness or numbness?",
                    "Is it the worst headache of your life?", "Any nausea or sensitivity to light?")),

    PSYCHIATRY("Psychiatry",
            List.of("Psychiatrist", "Mental Health Expert"),
            List.of("anxiety", "depression", "stress", "insomnia", "panic", "mood",
                    "mental", "worry", "sleepless", "low mood", "sad"),
            List.of("Stress or burnout", "Anxiety", "Sleep disturbance",
                    "Mood changes", "Life or work pressure"),
            List.of("Maintain a regular sleep schedule", "Practice breathing or mindfulness",
                    "Stay connected with people you trust", "Limit caffeine and alcohol", "Gentle daily exercise"),
            List.of("How long have you been feeling this way?", "How is your sleep and appetite?",
                    "Is it affecting your daily life?", "Do you have support around you?")),

    GASTROENTEROLOGY("Gastroenterology",
            List.of("Gastroenterologist"),
            List.of("stomach", "digestion", "digestive", "acidity", "constipation", "diarrhea",
                    "nausea", "vomit", "gas", "bloating", "indigestion", "abdominal", "stomach pain"),
            List.of("Indigestion or acidity", "Food intolerance", "Mild infection",
                    "Irregular eating habits", "Dehydration"),
            List.of("Eat light, home-cooked meals", "Stay hydrated", "Avoid spicy/oily food",
                    "Eat smaller, frequent meals", "Avoid lying down right after eating"),
            List.of("How long has this lasted?", "Any fever, blood or severe pain?",
                    "Any recent change in food or water?", "How is your appetite?")),

    ENT("ENT",
            List.of("ENT Specialist"),
            List.of("ear", "throat", "nose", "sinus", "hearing", "tinnitus", "tonsil", "sore throat", "ear pain"),
            List.of("Infection (ear/throat/sinus)", "Allergy", "Congestion",
                    "Wax build-up", "Viral cold"),
            List.of("Stay hydrated and rest", "Warm salt-water gargle for throat", "Steam inhalation for congestion",
                    "Avoid cold drinks", "Avoid inserting objects in the ear"),
            List.of("How long have you had it?", "Any fever or discharge?",
                    "Any hearing change or pain?", "Any recent cold or allergy?")),

    GYNECOLOGY("Gynecology",
            List.of("Gynecologist"),
            List.of("period", "menstrual", "pregnancy", "pregnant", "vaginal", "pcos", "menopause", "uterus"),
            List.of("Hormonal changes", "Menstrual irregularity", "PCOS-related causes",
                    "Pregnancy-related changes", "Stress"),
            List.of("Track your cycle", "Maintain a balanced diet", "Stay hydrated",
                    "Manage stress", "Note any unusual bleeding or pain"),
            List.of("When was your last period?", "Is the cycle regular?",
                    "Any pain, unusual bleeding or discharge?", "Could you be pregnant?")),

    OPHTHALMOLOGY("Ophthalmology",
            List.of("Ophthalmologist"),
            List.of("eye", "vision", "blurry", "blurred", "sight", "watery eyes", "eye pain", "red eye"),
            List.of("Eye strain", "Dryness or allergy", "Infection (conjunctivitis)",
                    "Refractive error", "Screen overuse"),
            List.of("Rest your eyes (20-20-20 rule)", "Avoid rubbing", "Use lubricating drops if dry",
                    "Reduce screen brightness", "Maintain good lighting"),
            List.of("How long has this been going on?", "Any pain, redness or discharge?",
                    "Is your vision blurred?", "Do you use screens for long hours?")),

    PEDIATRICS("Pediatrics",
            List.of("Pediatrician"),
            List.of("child", "baby", "infant", "kid", "toddler", "my son", "my daughter"),
            List.of("Common childhood infection", "Teething or growth-related discomfort",
                    "Mild viral illness", "Dietary cause"),
            List.of("Keep the child hydrated", "Ensure rest", "Monitor temperature",
                    "Light, easy-to-digest food", "Watch for worsening signs"),
            List.of("How old is the child?", "Any fever and how high?",
                    "Is the child eating and active?", "How long have the symptoms lasted?")),

    ENDOCRINE("Endocrinology",
            List.of("Endocrinologist", "Diabetologist"),
            List.of("diabetes", "sugar", "thyroid", "hormone", "weight gain", "weight loss"),
            List.of("Blood sugar variation", "Thyroid imbalance", "Hormonal changes",
                    "Lifestyle and diet factors", "Metabolic causes"),
            List.of("Maintain a balanced, low-sugar diet", "Exercise regularly", "Stay hydrated",
                    "Monitor relevant levels", "Maintain regular sleep"),
            List.of("How long have you noticed this?", "Any family history?",
                    "Any change in appetite, thirst or weight?", "Are your levels being monitored?")),

    PULMONOLOGY("Pulmonology",
            List.of("Pulmonologist"),
            List.of("breathing", "asthma", "cough", "wheezing", "lungs", "breathless"),
            List.of("Respiratory infection", "Allergy or asthma", "Cold or flu",
                    "Air-quality irritation", "Needs evaluation if persistent"),
            List.of("Rest and stay hydrated", "Avoid smoke and dust", "Use steam for congestion",
                    "Warm fluids", "Seek care if breathing worsens"),
            List.of("How long have you had it?", "Any breathlessness or chest tightness?",
                    "Any fever?", "Do you have asthma or allergies?")),

    UROLOGY("Urology",
            List.of("Urologist"),
            List.of("urine", "urinary", "kidney", "bladder", "urination", "burning urination"),
            List.of("Urinary tract irritation/infection", "Dehydration", "Kidney-related causes",
                    "Stone-related causes", "Needs evaluation"),
            List.of("Drink plenty of water", "Avoid holding urine", "Maintain hygiene",
                    "Limit caffeine", "Note any pain or blood"),
            List.of("How long has this lasted?", "Any burning, pain or blood?",
                    "How is your fluid intake?", "Any fever or back pain?")),

    DENTAL("Dental",
            List.of("Dentist"),
            List.of("tooth", "teeth", "toothache", "gum", "cavity", "dental"),
            List.of("Cavity or decay", "Gum inflammation", "Sensitivity",
                    "Infection", "Wisdom-tooth related"),
            List.of("Rinse with warm salt water", "Avoid very hot/cold/sweet food", "Maintain oral hygiene",
                    "Use a soft toothbrush", "Avoid chewing on the affected side"),
            List.of("How long has the pain lasted?", "Is it sensitive to hot/cold/sweet?",
                    "Any swelling or fever?", "Which tooth area is affected?")),

    NUTRITION("Nutrition",
            List.of("Nutritionist"),
            List.of("diet", "nutrition", "obesity", "overweight", "weight"),
            List.of("Dietary imbalance", "Lifestyle factors", "Low activity level",
                    "Metabolic factors", "Irregular eating"),
            List.of("Eat a balanced, portion-controlled diet", "Stay active daily", "Stay hydrated",
                    "Limit processed sugar", "Maintain regular meal times"),
            List.of("What are your current eating habits?", "How active are you daily?",
                    "Any specific goal (loss/gain)?", "Any medical conditions?")),

    GENERAL_MEDICINE("General Medicine",
            List.of("General Physician"),
            List.of("fever", "cold", "flu", "body pain", "weakness", "fatigue", "tired", "infection", "cough", "headache"),
            List.of("Viral infection", "Common cold or flu", "Fatigue or exhaustion",
                    "Mild infection", "Seasonal illness"),
            List.of("Rest well", "Stay hydrated", "Eat light, nutritious food",
                    "Monitor your temperature", "Seek care if it worsens"),
            List.of("How long have you had this?", "Any high fever?",
                    "Any other symptoms?", "Are you able to eat and drink?"));

    private final String displayName;
    private final List<String> specialists;
    private final List<String> keywords;
    private final List<String> possibleCauses;
    private final List<String> selfCare;
    private final List<String> followUps;

    TriageCategory(String displayName, List<String> specialists, List<String> keywords,
                   List<String> possibleCauses, List<String> selfCare, List<String> followUps) {
        this.displayName = displayName;
        this.specialists = specialists;
        this.keywords = keywords;
        this.possibleCauses = possibleCauses;
        this.selfCare = selfCare;
        this.followUps = followUps;
    }

    public String displayName() { return displayName; }
    public List<String> specialists() { return specialists; }
    public List<String> keywords() { return keywords; }
    public List<String> possibleCauses() { return possibleCauses; }
    public List<String> selfCare() { return selfCare; }
    public List<String> followUps() { return followUps; }
}
