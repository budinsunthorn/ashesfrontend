import Skeleton from 'react-loading-skeleton';
import 'react-loading-skeleton/dist/skeleton.css';

const SkeletonLoader = () => {
  return (
    <div className="skeleton-loader">
      <div className="skeleton-header">
        <Skeleton height={30} width={150} />
      </div>
      <div className="skeleton-content">
        <Skeleton count={3} height={20} />
      </div>
      <div className="skeleton-footer">
        <Skeleton circle={true} height={50} width={50} />
        <Skeleton height={30} width={100} />
      </div>
    </div>
  );
};

export default SkeletonLoader;