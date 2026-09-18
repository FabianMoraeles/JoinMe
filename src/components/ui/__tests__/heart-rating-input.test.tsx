import { fireEvent, render } from '@testing-library/react-native';

import { HeartRatingInput } from '@/components/ui/heart-rating-input';

describe('<HeartRatingInput />', () => {
  test('shows the label for the current value', async () => {
    const { getByText } = await render(<HeartRatingInput value={3} onChange={jest.fn()} />);
    getByText('3.0 - La pasamos bien');
  });

  test('calls onChange with the tapped heart count', async () => {
    const onChange = jest.fn();
    const { getByLabelText } = await render(<HeartRatingInput value={1} onChange={onChange} />);
    fireEvent.press(getByLabelText('4 corazones'));
    expect(onChange).toHaveBeenCalledWith(4);
  });
});
