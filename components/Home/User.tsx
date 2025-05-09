import { useMiniAppContext } from '@/hooks/use-miniapp-context'
import { useConnect } from 'wagmi'
import { farcasterFrame } from '@farcaster/frame-wagmi-connector'
import Image from 'next/image'

interface UserProps {
  compact?: boolean
}

export function User({ compact = false }: UserProps) {
  const { context } = useMiniAppContext()
  const { connect } = useConnect()

  if (compact) {
    return (
      <div
        className="flex items-center space-x-2 cursor-pointer"
        onClick={() => connect({ connector: farcasterFrame() })}
      >
        {context?.user?.pfpUrl ? (
          <Image
            src={context?.user?.pfpUrl}
            className="rounded-full border border-[#333]"
            alt="User Profile"
            width={32}
            height={32}
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center">
            <span className="text-xs font-medium">FC</span>
          </div>
        )}
        <span className="text-sm font-medium text-white">
          {context?.user?.displayName || context?.user?.username || 'Connect'}
        </span>
      </div>
    )
  }

  return (
    <div className="space-y-4 border border-[#333] rounded-md p-4">
      <h2 className="text-xl font-bold text-left">sdk.context</h2>
      <div className="flex flex-row space-x-4 justify-start items-start">
        {context?.user ? (
          <>
            {context?.user?.pfpUrl && (
              <Image
                src={context?.user?.pfpUrl}
                className="rounded-full"
                alt="User Profile Picture"
                width={56}
                height={56}
              />
            )}
            <div className="flex flex-col justify-start items-start space-y-2">
              <p className="text-sm text-left">
                user.displayName:{' '}
                <span className="bg-white font-mono text-black rounded-md p-[4px]">
                  {context?.user?.displayName}
                </span>
              </p>
              <p className="text-sm text-left">
                user.username:{' '}
                <span className="bg-white font-mono text-black rounded-md p-[4px]">
                  {context?.user?.username}
                </span>
              </p>
              <p className="text-sm text-left">
                user.fid:{' '}
                <span className="bg-white font-mono text-black rounded-md p-[4px]">
                  {context?.user?.fid}
                </span>
              </p>
            </div>
          </>
        ) : (
          <p className="text-sm text-left">User context not available</p>
        )}
      </div>
    </div>
  )
}
