import { FieldDomain } from '@/components/domain_driven/field_domain';
import { Button } from '@/components/ui/button';
import { useState } from 'react';
import { Option } from '../select/dd_select_field';
import { DDGroupCheckboxField } from './dd_group_checkbox';

// Example options
const exampleOptions: Option<string>[] = [
  { id: '1', value: 'option1', label: 'Option 1' },
  { id: '2', value: 'option2', label: 'Option 2' },
  { id: '3', value: 'option3', label: 'Option 3' },
  { id: '4', value: 'option4', label: 'Option 4' },
  { id: '5', value: 'option5', label: 'Option 5' },
  { id: '6', value: 'option6', label: 'Option 6' },
];

export const DDGroupCheckboxDemo = () => {
  // Create a field domain for the checkboxes
  const [checkboxDomain] = useState(
    () =>
      new FieldDomain<Option<string>[]>(
        'two_column_optionsv1',
        [], // Pre-select some options
        {
          label: 'Two Column Layout v1',
          description: 'This example uses a 2-column layout',
        },
      ),
  );

  const handleValidate = () => {
    checkboxDomain.validate().catch(() => {
      // Error will be displayed by the component
    });
  };

  const handleReset = () => {
    checkboxDomain.reset();
    // twoColCheckboxDomain.reset();
  };

  const handleLogValues = () => {
    console.log('Single column values:', checkboxDomain.getValue());
    // console.log('Two column values:', twoColCheckboxDomain.getValue());
  };

  return (
    <div className="space-y-8 p-4">
      <div className="space-y-6">
        <DDGroupCheckboxField domain={checkboxDomain} options={exampleOptions} isInline />
        <DDGroupCheckboxField domain={checkboxDomain} options={exampleOptions} />

        <div className="flex space-x-4">
          <Button onClick={handleValidate}>Validate</Button>
          <Button variant="outline" onClick={handleReset}>
            Reset
          </Button>
          <Button variant="secondary" onClick={handleLogValues}>
            Log Values
          </Button>
        </div>
      </div>
    </div>
  );
};
