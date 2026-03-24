import { useTranslation } from 'react-i18next';

import GradworkClosing from '../components/features/gradwork/GradworkClosing';
import GradworkHeader from '../components/features/gradwork/GradworkHeader';
import GradworkResults from '../components/features/gradwork/GradworkResults';
import GradworkSetup from '../components/features/gradwork/GradworkSetup';
import GradworkSolution from '../components/features/gradwork/GradworkSolution';
import SEO from '../components/layout/SEO';

/** Bachelor thesis page covering real-time ML audio generation research. */
const Gradwork = () => {
    const { t } = useTranslation('gradwork');

    return (
        <div className="min-h-screen">
            <SEO
                title={t('seo.title')}
                description={t('seo.description')}
            />

            <GradworkHeader t={t} />
            <GradworkSetup t={t} />
            <GradworkResults t={t} />
            <GradworkSolution t={t} />
            <GradworkClosing t={t} />
        </div>
    );
};

export default Gradwork;
