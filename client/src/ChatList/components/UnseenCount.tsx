export interface UnseenCountProps {
    count: number
}

export const UnseenCount = ({count}: UnseenCountProps) => {
  return (
    <div className="w-8 h-8 bg-blue-500 rounded-full flex justify-center items-center">
        <label className="text-white">{count}</label>
    </div>
  )
}
