import { config } from '../../config/config.js';
import { ValidationResult } from './types.js';

export class TerminalValidator {
  public validate(command: string, args: string[] = []): ValidationResult {
    const fullCommand = `${command} ${args.join(' ')}`.trim();
    const lowerCommand = command.toLowerCase();

    if (config.blockedCommands.includes(lowerCommand)) {
      return {
        isValid: false,
        reason: `Command '${command}' is strictly forbidden for security reasons.`
      };
    }

    for (const pattern of config.dangerousPatterns) {
      if (pattern.test(fullCommand)) {
        return {
          isValid: false,
          reason: `Command matches a dangerous pattern and was blocked.`
        };
      }
    }

    return { isValid: true };
  }
}