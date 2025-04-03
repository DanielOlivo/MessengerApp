import { describe, test, expect } from "vitest";
import { render, screen } from '@testing-library/react'
import { faker } from "@faker-js/faker";
import { getRandomChatItem } from "../utils";
import { Provider } from "../../../../utils/Provider";
import { Section, SectionProps } from "./Section";

describe('Section', () => {

    test('render', () => {
        const props: SectionProps = {
            title: faker.lorem.word(),
            iconSrc: '',
            items: Array.from({length: 10}, () => getRandomChatItem())
        }

        render(
            <Provider><Section {...props} /></Provider>
        )

        for(const item of props.items){
            expect(screen.queryByText(new RegExp(item.title))).toBeInTheDocument()
            expect(screen.queryByText(new RegExp(item.content))).toBeInTheDocument()
        }
    })

})