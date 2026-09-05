import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

/** Validateur de groupe : échoue si les deux champs nommés ne contiennent pas la même valeur. */
export function passwordsMatchValidator(passField: string, confirmField: string): ValidatorFn {
  return (group: AbstractControl): ValidationErrors | null => {
    const pass = group.get(passField)?.value;
    const confirm = group.get(confirmField)?.value;
    if (!confirm) return null; // laisse Validators.required gérer le champ vide
    return pass === confirm ? null : { mismatch: true };
  };
}
