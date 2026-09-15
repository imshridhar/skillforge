import { execSync } from 'child_process';
import fs from 'fs';

try {
  execSync('npx tsc -b > true_errors.txt 2>&1', { stdio: 'inherit' });
  console.log('Success');
} catch (e) {
  console.log('Finished with errors');
}
