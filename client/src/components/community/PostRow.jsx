import { Link } from 'react-router-dom';
import { formatDate } from '../../utils/format';

/** One discussion in the list. Opens /community/:id. */
export default function PostRow({ post }) {
  return (
    <li data-testid="post-row">
      <Link
        to={`/community/${post.id}`}
        className="block rounded-2xl border border-forest-800/10 bg-white p-5 shadow-card transition hover:-translate-y-0.5 hover:shadow-card-hover"
      >
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full bg-gold-500/15 px-2.5 py-0.5 font-semibold text-gold-600">{post.topic}</span>
          <span className="text-ink/50">
            by {post.author} · {formatDate(post.createdAt)}
          </span>
        </div>
        <h3 className="mt-2 text-lg font-semibold text-forest-900">{post.title}</h3>
        <p className="mt-1 line-clamp-2 text-sm text-ink/70">{post.body}</p>
        <p className="mt-3 text-xs font-medium text-forest-800">
          {post.commentCount} {post.commentCount === 1 ? 'reply' : 'replies'}
        </p>
      </Link>
    </li>
  );
}
