# Family Neighborhood V3 field map

This map is extracted from [`family-neighborhood-v3.tsx`](family-neighborhood-v3.tsx).
The source contains **48 distinct demo field IDs** across nine tables. The “Role in source”
column is the variable name in the React file, **not** a verified Airtable field name or type.
Use it to locate each reference, then check the actual schema and remap IDs in your own base.

The nine table custom properties and their roles are listed in the [setup notes](README.md).
Also replace `DEFAULT_STAFF_RECORD_ID` with a record in your own Staff table.
`TASK_POINTS_FIELD_ID` is the Case tasks points field listed below.

## Fields

### Staff (10)

| Role in source | Demo field ID |
| --- | --- |
| `nameField` | `flduNDpRAl2R9aaXR` |
| `photoField` | `fldRoMDZjUCTFkM07` |
| `pointsEarnedField` | `fldWZqV2x7VwnNpwO` |
| `badgeBonusField` | `fldYFntcUtD8s2C4N` |
| `totalScoreField` | `fldJ1J9oWadcB0qpR` |
| `pointsGoalField` | `fldH4WFT5iNDAAeko` |
| `levelField` | `fldVSaRGti2ogQwqV` |
| `badgesLinkField` | `fldhMps6x5lDOGyvV` |
| `activeField` | `fldKujGVyat1jJQ9T` |
| `caseTasksField` | `fldtss3huBAeIdWwP` |

### Families (3)

| Role in source | Demo field ID |
| --- | --- |
| `householdLabelField` | `fldJD2sLLeqGxKXMI` |
| `applicantsLinkField` | `fldBDCaOLMN8h53N6` |
| `caseTasksLinkField` | `fldFTQqC2Q2XsGexc` |

### Case tasks (12)

| Role in source | Demo field ID |
| --- | --- |
| `nameField` | `fld5br7oTfBIoN3Wm` |
| `statusField` | `fldSB3O0rvPi6iy4n` |
| `doneField` | `fldhNZpoLxTe8MmpT` |
| `completedAtField` | `fldOt53zMoDB7cMXg` |
| `internalDueField` | `fldqCxrMLhZA7o2lu` |
| `countyDueField` | `fldDiyFmnOOcoh562` |
| `difficultyField` | `fld6efNQk4jh4YTQH` |
| `whyItMattersField` | `fld5nvJFy4yz7stbB` |
| `documentsLinkField` | `fldnPBXnPGIMFpGfV` |
| `pointsField` | `fldKGgw7Cn9PESJ3w` |
| `assignedStaffField` | `fldVJi2CPGW3Npm61` |
| `applicationField` | `fldUvN2fAIuYvmjPD` |

### Applicants (6)

| Role in source | Demo field ID |
| --- | --- |
| `nameField` | `fld5trzkv4kTnHPIn` |
| `reqPeriodField` | `fldLbhOsn3HEwJBWm` |
| `modulesRequiredField` | `fldxySeDwoW6sGUgd` |
| `modulesCompletedField` | `fldayyiXOp81rQ8nS` |
| `requirementsLinkField` | `fldzaAJbLNSceFAQm` |
| `certsLinkField` | `fldxwdl4IuYXDmUqf` |

### Requirements (3)

| Role in source | Demo field ID |
| --- | --- |
| `reqModuleLinkField` | `flduHDAeGCTSvj6cA` |
| `completionResultField` | `fldhIzOfeApDvEOpQ` |
| `integrityWarningField` | `fldIIGBE7aEXmXaJI` |

### Modules (3)

| Role in source | Demo field ID |
| --- | --- |
| `moduleCodeField` | `fldDzgWhoMqfmYV9V` |
| `moduleNameField` | `fldqmTTcEcTWgLAmU` |
| `moduleSequenceField` | `fldtQnExC3aZfsT5q` |

### Certificates (3)

| Role in source | Demo field ID |
| --- | --- |
| `certPdfField` | `fldi4zwJ2n5JxL5yP` |
| `certReviewStatusField` | `fldy51sV3dX5L8q7b` |
| `certSubmittedAtField` | `fldxkbdLgOrw1uBsv` |

### Documents (4)

| Role in source | Demo field ID |
| --- | --- |
| `docNameField` | `fldcLlPeCEesqkstz` |
| `pdfField` | `fldpNEyInIZKLNUNu` |
| `needsReviewField` | `fld82GncjeBJuxvVa` |
| `parsingStatusField` | `fldo1zuuvIeUpSmbm` |

### Badges (4)

| Role in source | Demo field ID |
| --- | --- |
| `badgeNameField` | `fldMgKrM6SJyPzBEr` |
| `whatItTakesField` | `fldNL7dioXR2V6S1r` |
| `activeField` | `flddm7wTDReUXtlem` |
| `categoryField` | `fldlXYKCGAjx8tP44` |

## Before using another base

1. Connect all nine tables in the element Data panel and expose the needed fields.
2. Replace each demo field ID and the default Staff record ID with values from your base.
3. Verify linked-record direction, field types, select options, and computed values against the actual schema.
4. Check the rendered panels, task write permissions, saved status, completion timestamp, and refresh behavior.

Missing fields may silently render as blank or zero because `getFieldIfExists` returns `undefined`.
This map is a porting guide, not a ready-to-import Airtable schema.
