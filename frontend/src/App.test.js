import { render, screen, fireEvent } from '@testing-library/react';
import Header from './components/layout/Header';

const titleMap = { point: 'Points', line: 'Lines', polygon: 'Polygons' };
const iconMap = { point: '📍', line: '📏', polygon: '⬛' };

const renderHeader = (props = {}) => {
    const defaults = {
        selectedType: 'point',
        setSelectedType: jest.fn(),
        setSelectedId: jest.fn(),
        error: null,
        titleMap,
        iconMap,
        itemCount: 3,
        onOpenSearch: jest.fn(),
        onOpenManualEntry: jest.fn()
    };
    const merged = { ...defaults, ...props };
    render(<Header {...merged} />);
    return merged;
};

test('renders the brand and the item count', () => {
    renderHeader({ itemCount: 42 });
    expect(screen.getByText('Basarsoft GIS')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
});

test('switching tabs changes the geometry type and clears the selection', () => {
    const props = renderHeader();
    fireEvent.click(screen.getByTitle(/Switch to Lines/));
    expect(props.setSelectedType).toHaveBeenCalledWith('line');
    expect(props.setSelectedId).toHaveBeenCalledWith(null);
});

test('shows API errors', () => {
    renderHeader({ error: 'Failed to load points' });
    expect(screen.getByText(/Failed to load points/)).toBeInTheDocument();
});

test('opens manual entry for the selected type', () => {
    const props = renderHeader({ selectedType: 'polygon' });
    fireEvent.click(screen.getByText(/Add Polygon Manually/));
    expect(props.onOpenManualEntry).toHaveBeenCalledWith('polygon');
});
