import SEO from '../components/layout/SEO';
import { useTranslation } from 'react-i18next';
import GradworkHeader from '../components/features/gradwork/GradworkHeader';
import GradworkSetup from '../components/features/gradwork/GradworkSetup';
import GradworkResults from '../components/features/gradwork/GradworkResults';
import GradworkSolution from '../components/features/gradwork/GradworkSolution';
import GradworkClosing from '../components/features/gradwork/GradworkClosing';

const Gradwork = () => {
    const { t } = useTranslation('gradwork');

    return (
        <div className="min-h-screen -mt-16">
            <SEO
                title="AI Audio Research | Igor Szuniewicz"
                description="Bachelor Thesis: Can AI generate sound effects in real-time for video games?"
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
