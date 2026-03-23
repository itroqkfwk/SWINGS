import { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Confetti from "react-confetti";

import useGroupCreate from "../hooks/useGroupCreate";
import { useKakaoMap } from "../hooks/useKakaoMap";
import MatchGroupStepSection from "../components/MatchGroupStepSection";

const MatchGroupCreate = ({ isModal = false, onSuccess }) => {
  const [step, setStep] = useState(1);

  const {
    groupData,
    setGroupData,
    selectedDate,
    setSelectedDate,
    selectedTime,
    setSelectedTime,
    loading,
    error,
    showSuccess,
    updateFemale,
    updateMale,
    handleChange,
    handleSubmit,
  } = useGroupCreate(onSuccess, step);

  const { handleAddressSearch } = useKakaoMap(groupData, setGroupData);

  const handleNext = () => setStep((prev) => Math.min(prev + 1, 3));
  const handleBack = () => setStep((prev) => Math.max(prev - 1, 1));

  return (
    <div className="relative flex max-h-[80vh] flex-col overflow-hidden">
      <AnimatePresence>
        {showSuccess && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col items-center justify-center py-10"
          >
            <Confetti numberOfPieces={250} recycle={false} />
            <h2 className="mb-2 mt-6 text-xl font-bold text-green-600">
              그룹 생성 완료!
            </h2>
          </motion.div>
        )}
      </AnimatePresence>

      {!showSuccess && (
        <>
          <form
            id="createGroupForm"
            onSubmit={handleSubmit}
            className="flex-1 space-y-6 overflow-y-auto px-2 pb-20"
          >
            {error && (
              <p className="text-center text-sm text-red-500">{error}</p>
            )}

            <MatchGroupStepSection
              step={step}
              groupData={groupData}
              handleChange={handleChange}
              updateFemale={updateFemale}
              updateMale={updateMale}
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              selectedTime={selectedTime}
              setSelectedTime={setSelectedTime}
              handleAddressSearch={handleAddressSearch}
              setGroupData={setGroupData}
            />
          </form>

          <div className="absolute bottom-0 left-0 z-20 flex w-full justify-between border-t bg-white px-4 py-3">
            {step > 1 ? (
              <button
                type="button"
                onClick={handleBack}
                className="px-4 py-2 text-sm text-gray-500 hover:text-black"
              >
                이전
              </button>
            ) : (
              <span />
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className="rounded-xl bg-custom-pink px-4 py-2 text-sm font-bold text-white"
              >
                다음 단계
              </button>
            ) : (
              <button
                type="submit"
                name="submit-final"
                form="createGroupForm"
                disabled={loading}
                className="rounded-xl bg-custom-pink px-6 py-2 font-bold text-white transition hover:bg-pink-500"
              >
                {loading ? "생성 중..." : "그룹 만들기"}
              </button>
            )}
          </div>
        </>
      )}
    </div>
  );
};

export default MatchGroupCreate;
